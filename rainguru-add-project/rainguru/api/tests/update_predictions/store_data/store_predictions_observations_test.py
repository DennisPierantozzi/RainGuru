import datetime
import mock
import numpy as np

from api.models import Predicted, Observed
from api.update_predictions.store_data import store_predictions_observations
from django.test import TestCase
from os.path import join


class StorePredictionsObservationsTestCase(TestCase):

    def test_store_forecast_images(self):
        with mock.patch('os.getcwd') as mock_getcwd, mock.patch('os.path.exists') as mock_path_exists, \
             mock.patch('os.mkdir') as mock_mkdir, \
             mock.patch('api.update_predictions.convert_data.convert_matrix_image.create_image') as mock_create_image, \
             mock.patch('api.memory_store.Store.store_predictions') as mock_store_predictions:

            frame1 = [[1, 2], [3, 4]]
            frame2 = [[5, 6], [7, 8]]
            forecast_list = [frame1, frame2]
            forecast_array = np.asarray(forecast_list)
            now = datetime.datetime(2019, 3, 2, 18, 5)

            test_root = 'testroot'
            image_save_folder = join('media', 'predicted', '2019-03-02 18_05_00')
            image_save_folder_path = join('testroot', image_save_folder)

            urls = [join(image_save_folder, 'prediction00.png'), join(image_save_folder, 'prediction01.png')]

            mock_getcwd.return_value = test_root
            mock_path_exists.return_value = False

            store_predictions_observations.store_forecast_images(forecast_array, now)

            mock_mkdir.assert_called_with(image_save_folder_path)
            mock_create_image.assert_has_calls([mock.call(frame1, urls[0]), mock.call(frame2, urls[1])])
            mock_store_predictions.assert_called_with(urls, forecast_list, datetime.datetime(2019, 3, 2, 18, 10))

    def test_store_forecast_database(self):

            frame1 = [[1, 2], [3, 4]]
            frame2 = [[5, 6], [7, 8]]
            forecast_list = [frame1, frame2]
            forecast_array = np.asarray(forecast_list)
            now = datetime.datetime(2019, 3, 2, 18, 5)

            store_predictions_observations.store_forecast_database(forecast_array, now)

            predicted_list = Predicted.objects.all()

            self.assertTrue(predicted_list.filter(calculation_time=now,
                                                  prediction_time=now + datetime.timedelta(minutes=5),
                                                  ).exists())
            self.assertTrue(predicted_list.filter(calculation_time=now,
                                                  prediction_time=now + datetime.timedelta(minutes=10),
                                                  ).exists())

    def test_store_observed_database(self):
        frame1 = [[[[1, 2], [3, 4]]]]
        frame2 = [[[[5, 6], [7, 8]]]]
        observed_list = [frame1, frame2]
        observed_array = np.asarray(observed_list)
        now = datetime.datetime(2019, 3, 2, 18, 5)

        store_predictions_observations.store_observed_database(observed_array, now)

        observed_list = Observed.objects.all()

        self.assertTrue(observed_list.filter(time=now - datetime.timedelta(minutes=20)).exists())
        self.assertTrue(observed_list.filter(time=now - datetime.timedelta(minutes=15)).exists())

    def test_store_observed_images(self):
        with mock.patch('os.getcwd') as mock_getcwd, mock.patch('os.listdir') as mock_listdir, \
             mock.patch('api.update_predictions.convert_data.convert_matrix_image.create_image') as mock_create_image:

            frame1 = [[[[1, 2], [3, 4]]]]
            frame2 = [[[[5, 6], [7, 8]]]]
            observed_list = [frame1, frame2]
            observed_array = np.asarray(observed_list)
            now = datetime.datetime(2019, 3, 2, 18, 5)

            test_root = 'testroot'
            image_save_folder = join('media', 'observed')
            image_save_folder_path = join('testroot', image_save_folder)

            mock_getcwd.return_value = test_root
            mock_listdir.return_value = ['2019-03-02 17_45_00.png']

            store_predictions_observations.store_observed_images(observed_array, now)
            self.assertEqual(mock_create_image.call_args[0][1], join(image_save_folder_path, '2019-03-02 17_50_00.png'))

    def test_cleanup_observed_images_store_data_true(self):
        with mock.patch('os.getcwd') as mock_getcwd, mock.patch('os.listdir') as mock_listdir, \
             mock.patch('os.remove') as mock_remove:

            store_predictions_observations.store_data = True

            now = datetime.datetime(2019, 3, 2, 18, 5)

            test_root = 'testroot'
            image_save_folder = join('media', 'observed')
            image_save_folder_path = join('testroot', image_save_folder)

            mock_getcwd.return_value = test_root
            mock_listdir.return_value = ['2019-03-02 14_50_00.png', '2019-03-02 17_50_00.png']

            store_predictions_observations.cleanup_observed_images(now)

            mock_remove.assert_has_calls([mock.call(join(image_save_folder_path, '2019-03-02 14_50_00.png'))])


    def test_cleanup_observed_images_store_data_false(self):
        with mock.patch('os.getcwd') as mock_getcwd, mock.patch('os.listdir') as mock_listdir, \
                mock.patch('os.remove') as mock_remove:

            store_predictions_observations.store_data = False

            now = datetime.datetime(2019, 3, 2, 18, 5)

            test_root = 'testroot'
            image_save_folder = join('media', 'observed')
            image_save_folder_path = join('testroot', image_save_folder)

            mock_getcwd.return_value = test_root
            mock_listdir.return_value = ['2019-03-02 14_50_00.png', '2019-03-02 17_50_00.png']

            store_predictions_observations.cleanup_observed_images(now)

            mock_remove.assert_has_calls([mock.call(join(image_save_folder_path, '2019-03-02 14_50_00.png')),
                                          mock.call(join(image_save_folder_path, '2019-03-02 17_50_00.png'))
                                          ])

    def test_cleanup_prediction_images_store_data_true(self):
        with mock.patch('os.getcwd') as mock_getcwd, mock.patch('os.listdir') as mock_listdir, \
                mock.patch('shutil.rmtree') as mock_remove:

            store_predictions_observations.store_data = True

            now = datetime.datetime(2019, 3, 2, 18, 5)

            test_root = 'testroot'
            image_save_folder = join('media', 'predicted')
            image_save_folder_path = join('testroot', image_save_folder)

            mock_getcwd.return_value = test_root
            mock_listdir.return_value = ['2019-03-02 14_50_00', '2019-03-02 17_50_00']

            store_predictions_observations.cleanup_prediction_images(now)

            mock_remove.assert_has_calls([mock.call(join(image_save_folder_path, '2019-03-02 14_50_00'))])

    def test_cleanup_prediction_images_store_data_false(self):
        with mock.patch('os.getcwd') as mock_getcwd, mock.patch('os.listdir') as mock_listdir, \
                mock.patch('shutil.rmtree') as mock_remove:

            store_predictions_observations.store_data = False

            now = datetime.datetime(2019, 3, 2, 18, 5)

            test_root = 'testroot'
            image_save_folder = join('media', 'predicted')
            image_save_folder_path = join('testroot', image_save_folder)

            mock_getcwd.return_value = test_root
            mock_listdir.return_value = ['2019-03-02 14_50_00', '2019-03-02 17_50_00']

            store_predictions_observations.cleanup_prediction_images(now)

            mock_remove.assert_has_calls([mock.call(join(image_save_folder_path, '2019-03-02 14_50_00')),
                                          mock.call(join(image_save_folder_path, '2019-03-02 17_50_00'))
                                          ])

    def test_cleanup_observed_database_store_data_true(self):

        store_predictions_observations.store_data = True

        frame1 = [[[[1, 2], [3, 4]]]]
        frame2 = [[[[5, 6], [7, 8]]]]

        now = datetime.datetime(2019, 3, 2, 18, 5)

        observed1 = Observed()
        observed2 = Observed()
        observed1.time = datetime.datetime(2019, 3, 2, 18, 0)
        observed2.time = datetime.datetime(2019, 3, 2, 14, 5)
        observed1.matrix_data = frame1[0][0]
        observed2.matrix_data = frame2[0][0]

        observed1.save()
        observed2.save()

        store_predictions_observations.cleanup_observed_database(now)

        observed_list = Observed.objects.all()

        self.assertTrue(observed_list.filter(time=observed1.time).exists())
        self.assertFalse(observed_list.filter(time=observed2.time).exists())

    def test_cleanup_observed_database_store_data_false(self):

        store_predictions_observations.store_data = False

        frame1 = [[[[1, 2], [3, 4]]]]
        frame2 = [[[[5, 6], [7, 8]]]]

        now = datetime.datetime(2019, 3, 2, 18, 5)

        observed1 = Observed()
        observed2 = Observed()
        observed1.time = datetime.datetime(2019, 3, 2, 18, 0)
        observed2.time = datetime.datetime(2019, 3, 2, 14, 5)
        observed1.matrix_data = frame1[0][0]
        observed2.matrix_data = frame2[0][0]

        observed1.save()
        observed2.save()

        store_predictions_observations.cleanup_observed_database(now)

        observed_list = Observed.objects.all()

        self.assertFalse(observed_list.filter(time=observed1.time).exists())
        self.assertFalse(observed_list.filter(time=observed2.time).exists())

    def test_cleanup_predictions_database_store_data_true(self):

        store_predictions_observations.store_data = True

        frame1 = [[1, 2], [3, 4]]
        frame2 = [[5, 6], [7, 8]]

        now = datetime.datetime(2019, 3, 2, 18, 5)

        predicted1 = Predicted()
        predicted2 = Predicted()
        predicted3 = Predicted()
        predicted1.calculation_time = datetime.datetime(2019, 3, 2, 17, 0)
        predicted2.calculation_time = datetime.datetime(2019, 3, 2, 15, 0)
        predicted3.calculation_time = datetime.datetime(2019, 3, 2, 15, 5)
        predicted1.prediction_time = datetime.datetime(2019, 3, 2, 17, 15)
        predicted2.prediction_time = datetime.datetime(2019, 3, 2, 15, 20)
        predicted3.prediction_time = datetime.datetime(2019, 3, 2, 15, 25)
        predicted1.matrix_data = frame1
        predicted2.matrix_data = frame2
        predicted3.matrix_data = frame2

        predicted1.save()
        predicted2.save()
        predicted3.save()

        store_predictions_observations.cleanup_predictions_database(now)

        predicted_list = Predicted.objects.all()

        self.assertTrue(predicted_list.filter(calculation_time=predicted1.calculation_time).exists())
        self.assertFalse(predicted_list.filter(calculation_time=predicted2.calculation_time).exists())
        self.assertTrue(predicted_list.filter(calculation_time=predicted3.calculation_time).exists())

    def test_cleanup_predictions_database_store_data_false(self):

        store_predictions_observations.store_data = False

        frame1 = [[1, 2], [3, 4]]
        frame2 = [[5, 6], [7, 8]]

        now = datetime.datetime(2019, 3, 2, 18, 5)

        predicted1 = Predicted()
        predicted2 = Predicted()
        predicted3 = Predicted()
        predicted1.calculation_time = datetime.datetime(2019, 3, 2, 18, 0)
        predicted2.calculation_time = datetime.datetime(2019, 3, 2, 16, 0)
        predicted3.calculation_time = datetime.datetime(2019, 3, 2, 16, 5)
        predicted1.prediction_time = datetime.datetime(2019, 3, 2, 18, 15)
        predicted2.prediction_time = datetime.datetime(2019, 3, 2, 16, 20)
        predicted3.prediction_time = datetime.datetime(2019, 3, 2, 16, 25)
        predicted1.matrix_data = frame1
        predicted2.matrix_data = frame2
        predicted3.matrix_data = frame2

        predicted1.save()
        predicted2.save()
        predicted3.save()

        store_predictions_observations.cleanup_predictions_database(now)

        predicted_list = Predicted.objects.all()

        self.assertFalse(predicted_list.filter(calculation_time=predicted1.calculation_time).exists())
        self.assertFalse(predicted_list.filter(calculation_time=predicted2.calculation_time).exists())
        self.assertFalse(predicted_list.filter(calculation_time=predicted3.calculation_time).exists())
