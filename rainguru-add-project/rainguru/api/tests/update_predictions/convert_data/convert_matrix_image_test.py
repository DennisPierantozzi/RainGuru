from api.update_predictions.convert_data import convert_matrix_image
from django.test import SimpleTestCase


class ConvertMatrixImageTestCase(SimpleTestCase):

    def test_interpolate_color_middle(self):
        color = convert_matrix_image.interpolate_color([10, 200, 60, 80], [200, 100, 20, 0], 20, 30, 25)
        self.assertEqual(color, [105, 150, 40, 40])

    def test_interpolate_color_start(self):
        color = convert_matrix_image.interpolate_color([10, 200, 60, 80], [200, 100, 20, 0], 20, 30, 20)
        self.assertEqual(color, [10, 200, 60, 80])

    def test_interpolate_color_end(self):
        color = convert_matrix_image.interpolate_color([10, 200, 60, 80], [200, 100, 20, 0], 20, 30, 30)
        self.assertEqual(color, [200, 100, 20, 0])

    def test_compute_color_negative_1(self):
        color = convert_matrix_image.compute_color(-1)
        self.assertEqual(color, [0, 0, 0, 0])

    def test_compute_color_0(self):
        color = convert_matrix_image.compute_color(0)
        self.assertEqual(color, [255, 255, 255, 0])

    def test_compute_color_0_5(self):
        color = convert_matrix_image.compute_color(0.5)
        self.assertEqual(color, [131, 131, 255, 206])

    def test_compute_color_1(self):
        color = convert_matrix_image.compute_color(1)
        self.assertEqual(color, [0, 0, 255, 200])

    def test_compute_color_8(self):
        color = convert_matrix_image.compute_color(8)
        self.assertEqual(color, [198 + 1 / 3, 0, 56 + 2 / 3, 200])

    def test_compute_color_70(self):
        color = convert_matrix_image.compute_color(70)
        self.assertEqual(color, [255, 170, 0, 220])

    def test_compute_color_140(self):
        color = convert_matrix_image.compute_color(140)
        self.assertEqual(color, [255, 255, 0, 230])


