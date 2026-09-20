import importlib.util
import unittest
from pathlib import Path


module_path = Path(__file__).resolve().parents[1] / 'tools' / 'generate-audio.py'
spec = importlib.util.spec_from_file_location('generate_audio', module_path)
generator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(generator)


class GenerationRulesTest(unittest.TestCase):
    def test_sample_selection_covers_sound_categories(self):
        items = {text: f'audio/{index}.mp3' for index, text in enumerate(
            ['가', '까', '카', '와', '가다', '제가 가요.'])}
        selected = generator.select_entries(items, sample=True)
        self.assertEqual([text for text, _ in selected], list(items))

    def test_existing_files_are_skipped_unless_forced(self):
        self.assertFalse(generator.should_generate(True, False))
        self.assertTrue(generator.should_generate(True, True))
        self.assertTrue(generator.should_generate(False, False))

    def test_rejects_empty_or_silent_waveform(self):
        self.assertFalse(generator.usable_signal([], 22050))
        self.assertFalse(generator.usable_signal([0.0] * 1200, 22050))
        self.assertTrue(generator.usable_signal([0.1] * 1200, 22050))

    def test_progress_label_is_safe_for_non_unicode_windows_terminals(self):
        self.assertEqual(generator.ascii_label('가'), '\\uac00')

    def test_untrained_compound_vowels_expand_to_known_phones(self):
        vocab = {'<bos>': 2, 'h': 21, 'j': 24, 'e': 18, 'o': 37,
                 'w': 68, 'i': 22, 'ɐ': 70, 'ɛ': 72, 'ʌ': 86, 'ɯ': 82}
        self.assertEqual(generator.expand_phones(['<bos>', 'h', 'jɐ'], vocab),
                         ['<bos>', 'h', 'j', 'ɐ'])
        self.assertEqual(generator.expand_phones(['we', 'wi', 'ɰi'], vocab),
                         ['w', 'e', 'w', 'i', 'ɯ', 'i'])
        self.assertEqual(generator.expand_phones(['je', 'jo', 'jɛ', 'jʌ', 'wɛ', 'wʌ'], vocab),
                         ['j', 'e', 'j', 'o', 'j', 'ɛ', 'j', 'ʌ', 'w', 'ɛ', 'w', 'ʌ'])


if __name__ == '__main__':
    unittest.main()
