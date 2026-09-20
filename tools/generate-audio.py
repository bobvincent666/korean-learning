"""Generate publishable Korean MP3 assets from the current site manifest."""

import argparse
import importlib.util
import json
import math
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MODEL_ID = 'akamotaco/ppaso-tts-v1'
MODEL_REVISION = '53d09664c4f636a5fb6f2ebe3ec22cd83ee249b9'
SAMPLE_TEXTS = ('가', '까', '카', '와', '가다', '제가 가요.')
COMPOUND_PHONES = {
    'je': ('j', 'e'), 'jo': ('j', 'o'), 'jɐ': ('j', 'ɐ'),
    'jɛ': ('j', 'ɛ'), 'jʌ': ('j', 'ʌ'),
    'we': ('w', 'e'), 'wi': ('w', 'i'), 'wɐ': ('w', 'ɐ'),
    'wɛ': ('w', 'ɛ'), 'wʌ': ('w', 'ʌ'),
    'ɰi': ('ɯ', 'i'),
    '(question)': ('sil',),
}


def select_entries(items, sample=False):
    if not sample:
        return list(items.items())
    missing = [text for text in SAMPLE_TEXTS if text not in items]
    if missing:
        raise ValueError(f'Sample text missing from manifest: {missing}')
    return [(text, items[text]) for text in SAMPLE_TEXTS]


def should_generate(exists, force):
    return not exists or force


def ascii_label(text):
    return text.encode('unicode_escape').decode('ascii')


def usable_signal(wave, sample_rate):
    if len(wave) < sample_rate * 0.05:
        return False
    return all(math.isfinite(float(value)) for value in wave) and max(abs(float(value)) for value in wave) >= 0.001


def expand_phones(phones, vocabulary):
    """Avoid mapping diphthongs absent from the model vocabulary to <unk>."""
    expanded = []
    for phone in phones:
        replacements = COMPOUND_PHONES.get(phone, (phone,))
        for replacement in replacements:
            if replacement not in vocabulary:
                raise ValueError(f'Unsupported model phoneme: {ascii_label(replacement)}')
            expanded.append(replacement)
    return expanded


def load_model():
    from huggingface_hub import snapshot_download

    snapshot = Path(snapshot_download(
        repo_id=MODEL_ID,
        revision=MODEL_REVISION,
        allow_patterns=['config.json', 'example/ppaso_tts.py', 'onnx/*', 'runtime/*', 'runtime/**/*'],
    ))
    source = snapshot / 'example' / 'ppaso_tts.py'
    if not source.is_file():
        raise FileNotFoundError(f'Model code missing: {source}')
    spec = importlib.util.spec_from_file_location('ppaso_tts', source)
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    model = module.PpasoTTS(snapshot, backend='onnx')
    original_g2p = model._g2p
    model._g2p = lambda text: expand_phones(original_g2p(text), model._p2id)
    return model


def generate_one(model, text, destination):
    import soundfile as sf

    wave = model.synthesize(text)
    if not usable_signal(wave, 22050):
        raise ValueError(f'Empty, silent or invalid waveform for {text}')
    with tempfile.TemporaryDirectory(prefix='synthesis-', dir=destination.parent) as directory:
        wav = Path(directory) / 'source.wav'
        mp3 = Path(directory) / 'output.mp3'
        sf.write(wav, wave, 22050)
        subprocess.run([
            'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(wav),
            '-ac', '1', '-ar', '22050', '-b:a', '64k', str(mp3)
        ], check=True)
        subprocess.run([
            'ffmpeg', '-hide_banner', '-loglevel', 'error', '-i', str(mp3),
            '-f', 'null', '-'
        ], check=True, stdout=subprocess.DEVNULL)
        if mp3.stat().st_size == 0:
            raise ValueError(f'Empty MP3 for {text}')
        os.replace(mp3, destination)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--sample', action='store_true', help='Generate six representative utterances')
    parser.add_argument('--force', action='store_true', help='Overwrite existing audio assets')
    args = parser.parse_args()

    manifest = json.loads((ROOT / 'audio' / 'manifest.json').read_text(encoding='utf-8'))
    entries = select_entries(manifest['items'], args.sample)
    pending = []
    for text, relative in entries:
        if not re.fullmatch(r'audio/[a-f0-9]{24}\.mp3', relative):
            raise ValueError(f'Unsafe audio path for {text}: {relative}')
        destination = ROOT / relative
        if should_generate(destination.exists(), args.force):
            pending.append((text, destination))

    if not pending:
        print('All requested audio files already exist; nothing to generate.')
        return

    print(f'Loading pinned Korean model; {len(pending)} audio files to generate.', flush=True)
    model = load_model()
    for index, (text, destination) in enumerate(pending, 1):
        generate_one(model, text, destination)
        if args.sample or index % 10 == 0 or index == len(pending):
            print(f'Generated {index}/{len(pending)}: {ascii_label(text)}', flush=True)


if __name__ == '__main__':
    main()
