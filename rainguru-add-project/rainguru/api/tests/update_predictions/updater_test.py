import datetime
import mock
import numpy as np
import os

from api.logger.log_configuration import create_log
from api.update_predictions import updater
from api.update_predictions.download_data.exceptions import DownloadException
from django.test import SimpleTestCase


class UpdaterTestCase(SimpleTestCase):

    def test_update_download_fail(self):
        with mock.patch('api.update_predictions.download_data.download_radar_data.download') as mock_download, \
                mock.patch('datetime.datetime') as mock_datetime, \
                mock.patch('api.memory_store.Store.store_exception') as mock_store_exception, \
                mock.patch('api.update_predictions.updater.run_model') as mock_run_model, \
                mock.patch('api.models.Predicted.objects.all') as mock_get_all_objects, \
                mock.patch('api.models.Predicted.save') as mock_save:

            mock_delete = mock.Mock(name='delete')
            mock_all_objects = mock.Mock(name='all')
            mock_all_objects.delete = mock_delete

            timestamp_first = datetime.datetime(2020, 1, 3, 0, 10)
            timestamp_last = datetime.datetime(2020, 1, 3, 0, 30)

            mock_datetime.utcnow = mock.Mock(return_value=timestamp_last)
            mock_download.side_effect = DownloadException('Something went wrong!')
            mock_run_model.return_value = np.arange(20), np.arange(5)
            mock_get_all_objects.return_value = mock_all_objects

            save_dir = os.path.join(os.path.abspath(os.curdir), 'model_input')

            updater.set_data_choice(True)
            updater.update()

            mock_download.has_calls([mock.call(timestamp_last, save_dir)])
            mock_store_exception.has_calls([mock.call('Something went wrong!')])
            self.assertEqual(0, mock_run_model.call_count)
            self.assertEqual(0, mock_save.call_count)
            self.assertEqual(0, mock_delete.call_count)

    def test_logger_update(self):
        with self.assertLogs(__name__, level='DEBUG') as upd:
            logger = create_log(__name__)
            logger.info('test message')
            logger.warning('please be aware')
            self.assertEqual(upd.output, ['INFO:api.tests.update_predictions.updater_test:test message',
                                          'WARNING:api.tests.update_predictions.updater_test:please be aware'])

    def test_logger_no_log(self):
        with self.assertLogs(__name__, level='WARNING') as upd:
            logger = create_log(__name__)
            logger.info('not visible')
            logger.warning('visible')
            self.assertEqual(upd.output, ['WARNING:api.tests.update_predictions.updater_test:visible'])
