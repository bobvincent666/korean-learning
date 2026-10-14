import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('sync_courses', Path(__file__).resolve().parents[1] / 'tools' / 'sync-courses.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class CourseCompilerTests(unittest.TestCase):
    def test_tables_and_complete_answers_are_retained(self):
        note = '## 语法\n\n|韩语|中文|\n|---|---|\n|봄|春天|\n\n# 参考答案\n\n1. 봄\n2. 겨울\n'
        result = module.compile_course(note, 2, '语法', '02 语法.md')
        self.assertIn('class="course-table-scroll"', result['html'])
        self.assertIn('<li>겨울</li>', result['html'])
        self.assertIn('<details class="answer-box" id="course-answers">', result['html'])
        self.assertNotIn(' open', result['html'])
        self.assertEqual(result['outline'][-1]['id'], 'course-answers')

    def test_bold_headings_do_not_swallow_the_next_paragraph(self):
        note = '**1. 天气词汇**\n\n날씨＝天气。\n\n**参考答案**\n\n1. 안\n'
        result = module.compile_course(note, 5, '天气', '05 天气.md')
        self.assertIn('>1. 天气词汇</h2>', result['html'])
        self.assertIn('<p>날씨＝天气。</p>', result['html'])
        self.assertIn('<li>안</li>', result['html'])

    def test_duplicate_headings_have_distinct_outline_targets(self):
        result = module.compile_course('## 练习一\n\n题目\n\n## 练习一\n\n另一个题目', 2, '练习', '02 练习.md')
        ids = [item['id'] for item in result['outline']]
        self.assertEqual(len(ids), len(set(ids)))

    def test_missing_image_stops_compilation(self):
        with self.assertRaisesRegex(ValueError, 'Missing or invalid course image'):
            module.compile_course('![[missing.png]]', 1, '音标', '01 音标.md')

    def test_fill_in_blanks_are_not_parsed_as_emphasis(self):
        result = module.compile_course('1. 春____、夏____。\n2. 덥다 → ____；춥다 → ____。', 5, '练习', '05 练习.md')
        self.assertIn('春____、夏____', result['html'])
        self.assertIn('덥다 → ____；춥다 → ____', result['html'])
        self.assertNotIn('<em>', result['html'])
        self.assertNotIn('<strong>', result['html'])


if __name__ == '__main__':
    unittest.main()
