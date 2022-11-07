from api.update_predictions.download_data import file_date_utils
from django.test import SimpleTestCase
from os.path import join

import datetime

class FileDateUtilsTestCase(SimpleTestCase):
    def test_create_filename(self):
        date = datetime.datetime(2019, 10, 28, 11, 10)
        self.assertEqual('RAD_NL25_PCP_NA_201910281110.h5', file_date_utils.create_filename(date))

    def test_create_filename_single_digits(self):
        date = datetime.datetime(2019, 5, 6, 1, 0)
        self.assertEqual('RAD_NL25_PCP_NA_201905060100.h5', file_date_utils.create_filename(date))

    def test_get_date_string(self):
        self.assertEqual(join('2019', '2019-10-03'), file_date_utils.get_date_path(datetime.datetime(2019, 10, 3, 1, 2)))

    def test_get_timestamp_good_weather(self):
        filename = 'RAD_NL25_PCP_NA_201910281110.h5'
        date = datetime.datetime(2019, 10, 28, 11, 10)
        self.assertEqual(date, file_date_utils.get_timestamp(filename))

    def test_get_timestamp_bad_weather_length(self):
        with self.assertRaises(AssertionError):
            file_date_utils.get_timestamp('RAD_NL25_PCP_NA_2019310281110.h5')

    def test_get_timestamp_bad_weather_chars(self):
        with self.assertRaises(AssertionError):
            file_date_utils.get_timestamp('RAD_NL25_PCP_NA_2019nn281110.h5')

    def test_round_timestamp_basic(self):
        date = datetime.datetime(2019, 10, 28, 11, 14)
        self.assertEqual(datetime.datetime(2019, 10, 28, 11, 10), file_date_utils.round_timestamp(date))

    def test_round_timestamp_midnight(self):
        date = datetime.datetime(2019, 10, 28, 0, 0)
        self.assertEqual(datetime.datetime(2019, 10, 28, 0, 0), file_date_utils.round_timestamp(date))

    def test_round_timestamp_before_midnight(self):
        date = datetime.datetime(2019, 10, 28, 23, 59)
        self.assertEqual(datetime.datetime(2019, 10, 28, 23, 55), file_date_utils.round_timestamp(date))

    def test_round_timestamp_after_midnight(self):
        date = datetime.datetime(2019, 10, 28, 0, 1)
        self.assertEqual(datetime.datetime(2019, 10, 28, 0, 0), file_date_utils.round_timestamp(date))

    def test_create_filename_path(self):
        date = datetime.datetime(2019, 10, 28, 11, 10)
        self.assertEqual(join('2019', '2019-10-28', 'RAD_NL25_PCP_NA_201910281110.h5'), file_date_utils.create_filename_path(date))

