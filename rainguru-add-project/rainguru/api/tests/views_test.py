import datetime
import json
import mock

from datetime import timezone
from django.http import HttpResponse
from django.test import TestCase, Client


class ViewsTestCase(TestCase):

    def test_fetch_precipitation_x_y_none(self):
        client = Client()

        response = client.get('/api/precipitation')

        self.assertEqual(400, response.status_code)

    def test_fetch_precipitation_observed_none(self):
        client = Client()

        response = client.get('/api/precipitation?x=1&y=2')

        self.assertEqual(400, response.status_code)

    def test_fetch_precipitation_timestamp_none(self):
        with mock.patch('api.service.fetch_latest_predicted_precipitation') as mock_fetch_latest:
            client = Client()

            timestamp = datetime.datetime(2021, 3, 4, 12, 30)

            result = {
                'precipitation': [0, 1, 2, 3]
            }

            mock_fetch_latest.return_value = result
            expected_dict = result

            expected_response = HttpResponse(json.dumps(expected_dict))

            response = client.get('/api/precipitation?x=1&y=2&observed=false')

            self.assertEqual(expected_response.status_code, response.status_code)
            self.assertEqual(expected_response.content, response.content)



    def test_fetch_precipitation_observed(self):
        with mock.patch('api.service.fetch_observed_precipitation') as mock_fetch_observed:
            client = Client()

            timestamp = datetime.datetime(2021, 3, 4, 12, 30)

            result = {
                'precipitation': [0, 1, 2, 3]
            }

            mock_fetch_observed.return_value = result
            expected_dict = result

            expected_response = HttpResponse(json.dumps(expected_dict))

            response = client.get('/api/precipitation?x=1&y=2&observed=true&timestamp=' +
                                  str(int(timestamp.replace(tzinfo=timezone.utc).timestamp())))

            self.assertEqual(expected_response.status_code, response.status_code)
            self.assertEqual(expected_response.content, response.content)
            mock_fetch_observed.assert_called_with(timestamp, 1, 2)

    def test_fetch_precipitation_predicted(self):
        with mock.patch('api.service.fetch_predicted_precipitation') as mock_fetch_predicted:
            client = Client()

            timestamp = datetime.datetime(2021, 3, 4, 12, 30)

            result = {
                'precipitation': [0, 1, 2, 3]
            }

            mock_fetch_predicted.return_value = result
            expected_dict = result

            expected_response = HttpResponse(json.dumps(expected_dict))

            response = client.get('/api/precipitation?x=1&y=2&observed=false&timestamp=' +
                                  str(int(timestamp.replace(tzinfo=timezone.utc).timestamp())))

            self.assertEqual(expected_response.status_code, response.status_code)
            self.assertEqual(expected_response.content, response.content)
            mock_fetch_predicted.assert_called_with(timestamp, 1, 2)

    def test_fetch_urls_observed_none(self):
        client = Client()

        response = client.get('/api/fetch')

        self.assertEqual(400, response.status_code)

    def test_fetch_urls_timestamp_none(self):
        with mock.patch('api.service.fetch_latest_urls') as mock_fetch_latest:
            client = Client()

            timestamp = datetime.datetime(2021, 3, 4, 12, 30)

            result = {
                'urls': ['url1', 'url2'],
                'timestamp': timestamp.replace(tzinfo=timezone.utc).timestamp(),
                'exception_active': False,
                'exception_message': ''
            }

            mock_fetch_latest.return_value = result
            expected_dict = result

            expected_response = HttpResponse(json.dumps(expected_dict))

            response = client.get('/api/fetch?observed=false')

            self.assertEqual(expected_response.status_code, response.status_code)
            self.assertEqual(expected_response.content, response.content)

    def test_fetch_observed_urls(self):
        with mock.patch('api.service.fetch_observed_urls') as mock_fetch_observed:
            client = Client()

            timestamp = datetime.datetime(2021, 3, 4, 12, 30)

            result = {
                'urls': ['url1', 'url2'],
                'timestamp': timestamp.replace(tzinfo=timezone.utc).timestamp(),
                'exception_active': False,
                'exception_message': ''
            }

            mock_fetch_observed.return_value = result
            expected_dict = result

            expected_response = HttpResponse(json.dumps(expected_dict))

            response = client.get('/api/fetch?observed=true&compare=false&x=NaN&y=NaN&timestamp=' +
                                  str(int(timestamp.replace(tzinfo=timezone.utc).timestamp())))

            self.assertEqual(expected_response.status_code, response.status_code)
            self.assertEqual(expected_response.content, response.content)
            mock_fetch_observed.assert_called_with(timestamp)

    def test_fetch_predicted_urls(self):
        with mock.patch('api.service.fetch_predicted_urls') as mock_fetch_predicted:
            client = Client()

            timestamp = datetime.datetime(2021, 3, 4, 12, 30)

            result = {
                'urls': ['url1', 'url2'],
                'timestamp': timestamp.replace(tzinfo=timezone.utc).timestamp(),
                'exception_active': False,
                'exception_message': ''
            }

            mock_fetch_predicted.return_value = result
            expected_dict = result

            expected_response = HttpResponse(json.dumps(expected_dict))

            response = client.get('/api/fetch?observed=false&compare=false&x=NaN&y=NaN&timestamp=' +
                                  str(int(timestamp.replace(tzinfo=timezone.utc).timestamp())))

            self.assertEqual(expected_response.status_code, response.status_code)
            self.assertEqual(expected_response.content, response.content)
            mock_fetch_predicted.assert_called_with(timestamp)

    def test_get_data_availability(self):
        with mock.patch('api.service.get_data_availability') as mock_availability:
            client = Client()

            result = {
                'store_data': True,
                'predictions_stored': ['a', 'b'],
                'observations_stored': ['a', 'b']
            }

            mock_availability.return_value = result
            expected_dict = result

            expected_response = HttpResponse(json.dumps(expected_dict))

            response = client.get('/api/available')

            self.assertEqual(expected_response.status_code, response.status_code)
            self.assertEqual(expected_response.content, response.content)
            mock_availability.assert_called_with()

    def test_check_new_data(self):
        with mock.patch('api.service.check_new_data') as mock_check:
            client = Client()

            timestamp = datetime.datetime(2021, 3, 4, 12, 30)

            result = {
                'timestamp': timestamp.replace(tzinfo=timezone.utc).timestamp()
            }

            mock_check.return_value = result
            expected_dict = result

            expected_response = HttpResponse(json.dumps(expected_dict))

            response = client.get('/api/check')

            self.assertEqual(expected_response.status_code, response.status_code)
            self.assertEqual(expected_response.content, response.content)
            mock_check.assert_called_with()




