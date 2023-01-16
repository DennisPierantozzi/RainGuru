import datetime
import mock
import os

from api import service
from api.models import Observed, Predicted
from api.update_predictions.convert_data import convert_matrix_image
from api.update_predictions.store_data import store_predictions_observations
from datetime import timezone
from django.test import TestCase


class ServiceTestCase(TestCase):

    def setUp(self):
        convert_matrix_image.image_map = {(1, 0): (1, 0)}

    def test_get_data_availability_store_data_true(self):
        with mock.patch('api.update_predictions.store_data.store_predictions_observations.get_store_data') as mock_store_data, \
                mock.patch('os.listdir') as mock_listdir, \
                mock.patch('os.getcwd') as mock_getcwd:

            mock_store_data.return_value = True
            mock_getcwd.return_value = 'testroot'

            observed_timestamps = [datetime.datetime(2021, 8, 16, 12, 15), datetime.datetime(2021, 8, 16, 12, 20)]
            predicted_timestamps = [datetime.datetime(2021, 8, 16, 15, 15), datetime.datetime(2021, 8, 16, 15, 20)]

            observed_path = os.path.join('testroot', 'media', 'observed')
            predicted_path = os.path.join('testroot', 'media', 'predicted')
            mock_listdir.side_effect = lambda path: \
                {observed_path: [str(observed_timestamps[0]).replace(":", "_") + ".png",
                                 str(observed_timestamps[1]).replace(":", "_") + ".png",
                                 ],
                 predicted_path: [str(predicted_timestamps[0]).replace(":", "_"),
                                  str(predicted_timestamps[1]).replace(":", "_")
                                  ]
                 }[path]

            expected_dict = {
                'store_data': True,
                'predictions_stored': [predicted_timestamps[0].replace(tzinfo=timezone.utc).timestamp(),
                                       predicted_timestamps[1].replace(tzinfo=timezone.utc).timestamp()],
                'observations_stored': [observed_timestamps[0].replace(tzinfo=timezone.utc).timestamp(),
                                        observed_timestamps[1].replace(tzinfo=timezone.utc).timestamp()]
            }

            self.assertEqual(expected_dict, service.get_data_availability())

    def test_get_data_availability_store_data_false(self):
        with mock.patch('api.update_predictions.store_data.store_predictions_observations.get_store_data') as mock_store_data, \
                mock.patch('os.listdir') as mock_listdir, \
                mock.patch('os.getcwd') as mock_getcwd:

            mock_store_data.return_value = False
            mock_getcwd.return_value = 'testroot'
            mock_listdir.return_value = []

            expected_dict = {
                'store_data': False,
                'predictions_stored': [],
                'observations_stored': []
            }

            self.assertEqual(expected_dict, service.get_data_availability())

    def test_fetch_urls_latest(self):
        with mock.patch('api.memory_store.Store.fetch_urls') as mock_fetch_urls, \
                mock.patch('api.memory_store.Store.fetch_timestamp') as mock_fetch_timestamp, \
                mock.patch('api.memory_store.Store.is_exception_active') as mock_exception_active, \
                mock.patch('api.memory_store.Store.get_exception_message') as mock_exception_message:

            urls = ['url1, url2']
            timestamp = datetime.datetime(2021, 3, 4, 12, 30)

            mock_fetch_urls.return_value = urls, timestamp
            mock_fetch_timestamp.return_value = timestamp
            mock_exception_active.return_value = False
            mock_exception_message.return_value = ''

            expected_dict = {
                'urls': urls,
                'timestamp': timestamp.replace(tzinfo=timezone.utc).timestamp(),
                'exception_active': False,
                'exception_message': ''
            }

            self.assertEqual(expected_dict, service.fetch_latest_urls())

    def test_fetch_urls_observed(self):
        with mock.patch('os.listdir') as mock_listdir, mock.patch('os.getcwd') as mock_getcwd:
            timestamp1 = datetime.datetime(2019, 3, 2, 12, 15)
            timestamp2 = datetime.datetime(2019, 3, 2, 12, 20)
            timestamp3 = datetime.datetime(2019, 3, 2, 13, 50)
            timestamp4 = datetime.datetime(2019, 3, 2, 13, 55)

            mock_getcwd.return_value = 'testroot'

            observed_folder = os.path.join('media', 'observed')
            observed_path = os.path.join('testroot', observed_folder)

            images = [str(timestamp1).replace(":", "_") + '.png', str(timestamp2).replace(":", "_") + '.png',
                      str(timestamp3).replace(":", "_") + '.png', str(timestamp4).replace(":", "_") + '.png']

            mock_listdir.return_value = images

            urls = [os.path.join(observed_folder, images[0]), os.path.join(observed_folder, images[1]),
                    os.path.join(observed_folder, images[2])]

            expected_dict = {
                'urls': urls,
                'timestamp': timestamp1.replace(tzinfo=timezone.utc).timestamp(),
                'exception_active': False,
                'exception_message': ''
            }

            self.assertEqual(expected_dict, service.fetch_observed_urls(timestamp1))
            mock_listdir.assert_called_with(observed_path)

    def test_fetch_urls_predicted(self):
        with mock.patch('api.update_predictions.store_data.store_predictions_observations.get_store_data') \
                as mock_store_data, \
                mock.patch('api.memory_store.Store.fetch_timestamp') as mock_fetch_timestamp, \
                mock.patch('os.listdir') as mock_listdir, \
                mock.patch('os.getcwd') as mock_getcwd, \
                mock.patch('os.path.exists') as mock_path_exists:
            timestamp = datetime.datetime(2019, 3, 2, 12, 15)

            mock_fetch_timestamp.return_value = datetime.datetime(2022, 3, 4, 5, 20)
            mock_store_data.return_value = True
            mock_path_exists.return_value = True

            mock_getcwd.return_value = 'testroot'

            predicted_folder = os.path.join('media', 'predicted', str(timestamp).replace(":", "_"))
            predicted_path = os.path.join('testroot', predicted_folder)

            images = ['prediction0.png', 'prediction1.png']

            mock_listdir.return_value = images

            urls = [os.path.join(predicted_folder, images[0]), os.path.join(predicted_folder, images[1])]

            expected_dict = {
                'urls': urls,
                'timestamp': (timestamp + datetime.timedelta(minutes=5)).replace(tzinfo=timezone.utc).timestamp(),
                'exception_active': False,
                'exception_message': ''
            }

            self.assertEqual(expected_dict, service.fetch_predicted_urls(timestamp))
            mock_listdir.assert_called_with(predicted_path)

    def test_fetch_precipitation_latest(self):
        with mock.patch('api.memory_store.Store.fetch_matrices') as mock_fetch_matrices, \
                mock.patch('api.memory_store.Store.fetch_timestamp') as mock_fetch_timestamp:

            timestamp = datetime.datetime(2019, 3, 2, 12, 15)

            frame1 = [[0, 1], [2, 3]]
            frame2 = [[4, 5], [6, 7]]
            matrices = [frame1, frame2]

            mock_fetch_matrices.return_value = matrices
            mock_fetch_timestamp.return_value = timestamp

            expected_dict = {
                'precipitation': [1.0, 5.0]
            }

            self.assertEqual(expected_dict, service.fetch_latest_predicted_precipitation(1, 0))

    def test_fetch_precipitation_observed(self):
        with mock.patch('api.update_predictions.store_data.store_predictions_observations.get_store_data') \
                as mock_store_data:

            timestamp1 = datetime.datetime(2019, 3, 2, 12, 15)
            timestamp2 = datetime.datetime(2019, 3, 2, 12, 20)
            timestamp3 = datetime.datetime(2019, 3, 2, 13, 50)
            timestamp4 = datetime.datetime(2019, 3, 2, 13, 55)

            frame1 = [[0, 1], [2, 3]]
            frame2 = [[4, 5], [6, 7]]
            frame3 = [[8, 9], [10, 11]]

            o1 = Observed()
            o2 = Observed()
            o3 = Observed()
            o1.time = timestamp2
            o2.time = timestamp3
            o3.time = timestamp4
            o1.matrix_data_fast = store_predictions_observations.clean_matrix(frame1)
            o2.matrix_data_fast = store_predictions_observations.clean_matrix(frame2)
            o3.matrix_data_fast = store_predictions_observations.clean_matrix(frame3)
            o1.matrix_data = frame1
            o2.matrix_data = frame2
            o3.matrix_data = frame3
            o1.save()
            o2.save()
            o3.save()

            mock_store_data.return_value = True

            expected_dict = {
                'precipitation': [1.0, 5.0]
            }

            self.assertEqual(expected_dict, service.fetch_observed_precipitation(timestamp1, 1, 0))

    def test_fetch_precipitation_predicted(self):
        with mock.patch('api.update_predictions.store_data.store_predictions_observations.get_store_data') \
                as mock_store_data, \
                mock.patch('api.memory_store.Store.fetch_timestamp') as mock_fetch_timestamp:

            timestamp = datetime.datetime(2019, 3, 2, 12, 15)
            timestamp2 = datetime.datetime(2019, 3, 2, 12, 10)

            frame1 = [[0, 1], [2, 3]]
            frame2 = [[4, 5], [6, 7]]

            p1 = Predicted()
            p2 = Predicted()
            p1.calculation_time = timestamp
            p2.calculation_time = timestamp
            p1.prediction_time = datetime.datetime(2019, 3, 2, 12, 20)
            p2.prediction_time = datetime.datetime(2019, 3, 2, 12, 25)
            p1.matrix_data_fast = store_predictions_observations.clean_matrix(frame1)
            p2.matrix_data_fast = store_predictions_observations.clean_matrix(frame2)
            p1.matrix_data = frame1
            p2.matrix_data = frame2
            p1.save()
            p2.save()

            mock_store_data.return_value = True
            mock_fetch_timestamp.return_value = timestamp2

            expected_dict = {
                'precipitation': [1.0, 5.0]
            }

            self.assertEqual(expected_dict, service.fetch_predicted_precipitation(timestamp, 1, 0))


