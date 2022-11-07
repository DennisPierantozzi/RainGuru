import os
import torch

from api.prediction_model import generate_model_output
from django.test import TestCase


class IntegrateModelTestCase(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.forecast, cls.observed = generate_model_output. \
            run_model('2018-06-01 13:35:00', os.path.join(os.getcwd(), 'api', 'tests', 'model_input_test_data'))

    def test_model_produces_forecast_and_used(self):
        self.assertIsNotNone(self.forecast)
        self.assertIsNotNone(self.observed)

    def test_model_produces_correct_forecast_dimensions(self):
        self.assertEqual((20, 480, 480), self.forecast.shape)

    def test_model_produces_correct_observed_dimensions(self):
        self.assertEqual((5, 1, 1, 480, 480), self.observed.shape)

    def test_model_produces_correct_data_types(self):
        self.assertEqual(torch.float32, self.forecast.dtype)
        self.assertEqual('float32', self.observed.dtype)


