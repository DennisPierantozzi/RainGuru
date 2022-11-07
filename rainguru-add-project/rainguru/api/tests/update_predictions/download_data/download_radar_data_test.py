import datetime
import logging
import mock
import os

from api.logger.log_configuration import create_log
from api.update_predictions.download_data import download_radar_data, file_date_utils
from api.update_predictions.download_data.exceptions import DownloadException
from django.test import SimpleTestCase
from os.path import join


class DownloadRadarDataTestCase(SimpleTestCase):

    def test_fetch_latest_url_first_try(self):
        with mock.patch('api.update_predictions.download_data.make_knmi_requests.request_download_url') as mock_request_download_url:
            timestamp = datetime.datetime(2019, 10, 28, 11, 10)
            expected = ('url', 'RAD_NL25_PCP_NA_201910281110.h5', timestamp)

            mock_request_download_url.return_value = 200, None, 'url'

            result = download_radar_data.fetch_latest_url(timestamp)

            self.assertEqual(expected, result)

    def test_fetch_latest_url_second_try(self):
        with mock.patch('api.update_predictions.download_data.make_knmi_requests.request_download_url') as mock_request_download_url:
            timestamp = datetime.datetime(2019, 10, 28, 11, 15)
            file_unavailable = 'RAD_NL25_PCP_NA_201910281110.h5'
            file_available = 'RAD_NL25_PCP_NA_201910281115.h5'
            expected = ('url', file_available, timestamp)

            mock_request_download_url.side_effect = lambda file: {file_unavailable: (404, 'File not found', None), file_available: (200, None, 'url')}[file]

            result = download_radar_data.fetch_latest_url(timestamp)

            self.assertEqual(expected, result)

    def test_fetch_latest_url_unavailable(self):
        with mock.patch('api.update_predictions.download_data.make_knmi_requests.request_download_url') as mock_request_download_url:
            with self.assertRaises(Exception):
                timestamp = datetime.datetime(2019, 10, 28, 11, 15)
                mock_request_download_url.return_value = 404, 'File not found', None
                download_radar_data.fetch_latest_url(timestamp)

    def test_fetch_urls_files_not_exist(self):
        with mock.patch('api.update_predictions.download_data.make_knmi_requests.request_download_url') as mock_request_download_url:
            timestamp1 = datetime.datetime(2019, 10, 28, 11, 10)
            file1 = 'RAD_NL25_PCP_NA_201910281110.h5'
            timestamp2 = datetime.datetime(2019, 10, 28, 11, 5)
            file2 = 'RAD_NL25_PCP_NA_201910281105.h5'
            timestamp3 = datetime.datetime(2019, 10, 28, 11, 0)
            file3 = 'RAD_NL25_PCP_NA_201910281100.h5'
            timestamp4 = datetime.datetime(2019, 10, 28, 10, 55)
            file4 = 'RAD_NL25_PCP_NA_201910281055.h5'
            timestamp5 = datetime.datetime(2019, 10, 28, 10, 50)
            file5 = 'RAD_NL25_PCP_NA_201910281050.h5'

            expected = [('url', file1, timestamp1), ('url', file2, timestamp2), ('url', file3, timestamp3), ('url', file4, timestamp4), ('url', file5, timestamp5)], timestamp1

            mock_request_download_url.return_value = 200, None, 'url'

            result = download_radar_data.fetch_urls(timestamp1, 'mocksavefolder')

            self.assertEqual(expected, result)

    def test_fetch_urls_files_do_exist(self):
        with mock.patch('api.update_predictions.download_data.make_knmi_requests.request_download_url') as mock_request_download_url, \
                mock.patch('os.path.exists') as mock_os_exists:

            timestamp1 = datetime.datetime(2019, 10, 28, 11, 10)
            file1 = 'RAD_NL25_PCP_NA_201910281110.h5'
            timestamp2 = datetime.datetime(2019, 10, 28, 11, 5)
            file2 = 'RAD_NL25_PCP_NA_201910281105.h5'
            timestamp3 = datetime.datetime(2019, 10, 28, 11, 0)
            file3 = 'RAD_NL25_PCP_NA_201910281100.h5'
            timestamp4 = datetime.datetime(2019, 10, 28, 10, 55)
            file4 = 'RAD_NL25_PCP_NA_201910281055.h5'
            timestamp5 = datetime.datetime(2019, 10, 28, 10, 50)

            expected = [('url', file1, timestamp1), ('url', file2, timestamp2), ('url', file3, timestamp3), ('url', file4, timestamp4)], timestamp1

            mock_request_download_url.return_value = 200, None, 'url'
            mock_os_exists.side_effect = lambda path: {os.path.join(os.path.abspath(os.curdir), file_date_utils.create_filename_path(timestamp5)): True}.get(path, False)

            result = download_radar_data.fetch_urls(timestamp1, os.path.abspath(os.curdir))

            self.assertEqual(expected, result)

    def test_fetch_urls_files_unavailable(self):
        with mock.patch('api.update_predictions.download_data.make_knmi_requests.request_download_url') as mock_request_download_url, \
                mock.patch('os.path.exists') as mock_os_exists:
            with self.assertRaises(DownloadException):
                timestamp1 = datetime.datetime(2019, 10, 28, 11, 10)
                file1 = 'RAD_NL25_PCP_NA_201910281110.h5'
                timestamp2 = datetime.datetime(2019, 10, 28, 11, 5)
                file2 = 'RAD_NL25_PCP_NA_201910281105.h5'
                timestamp3 = datetime.datetime(2019, 10, 28, 11, 0)
                file3 = 'RAD_NL25_PCP_NA_201910281100.h5'
                timestamp4 = datetime.datetime(2019, 10, 28, 10, 55)
                file4 = 'RAD_NL25_PCP_NA_201910281055.h5'
                timestamp5 = datetime.datetime(2019, 10, 28, 10, 50)

                mock_request_download_url.side_effect = lambda path: {file_date_utils.create_filename(timestamp5): (404, 'File not found', None)}.get(path, (200, None, 'url'))
                mock_os_exists.return_value = False

                result = download_radar_data.fetch_urls(timestamp1, os.path.abspath(os.curdir))

    def test_fetch_urls_quota_exceeded(self):
        with mock.patch('api.update_predictions.download_data.make_knmi_requests.request_download_url') as mock_request_download_url, \
                mock.patch('os.path.exists') as mock_os_exists:
            with self.assertRaises(DownloadException):
                timestamp1 = datetime.datetime(2019, 10, 28, 11, 10)
                file1 = 'RAD_NL25_PCP_NA_201910281110.h5'
                timestamp2 = datetime.datetime(2019, 10, 28, 11, 5)
                file2 = 'RAD_NL25_PCP_NA_201910281105.h5'
                timestamp3 = datetime.datetime(2019, 10, 28, 11, 0)
                file3 = 'RAD_NL25_PCP_NA_201910281100.h5'
                timestamp4 = datetime.datetime(2019, 10, 28, 10, 55)
                file4 = 'RAD_NL25_PCP_NA_201910281055.h5'
                timestamp5 = datetime.datetime(2019, 10, 28, 10, 50)

                mock_request_download_url.side_effect = lambda path: {file_date_utils.create_filename(timestamp5): (403, 'Quota exceeded', None)}.get(path, (200, None, 'url'))
                mock_os_exists.return_value = False

                result = download_radar_data.fetch_urls(timestamp1, os.path.abspath(os.curdir))

    def test_download_data_dir_exists(self):
        with mock.patch('api.update_predictions.download_data.make_knmi_requests.download_file') as mock_download_file, \
                mock.patch('os.path.exists') as mock_os_exists, mock.patch('pathlib.Path.write_bytes') as mock_write, \
                mock.patch('pathlib.Path.__init__') as mock_path:
            timestamp1 = datetime.datetime(2019, 10, 28, 11, 10)
            file1 = 'RAD_NL25_PCP_NA_201910281110.h5'
            timestamp2 = datetime.datetime(2019, 10, 28, 11, 5)
            file2 = 'RAD_NL25_PCP_NA_201910281105.h5'

            urls = [('url1', file1, timestamp1), ('url2', file2, timestamp2)]

            mock_download_file.side_effect = lambda url: {'url1': (200, None, 32), 'url2': (200, None, 43)}[url]
            mock_os_exists.return_value = True
            mock_path.return_value = None

            download_radar_data.download_files(urls, 'mocksavefolder')

            mock_write.assert_has_calls([mock.call(32), mock.call(43)])
            mock_path.assert_has_calls([mock.call(join('mocksavefolder', '2019', '2019-10-28', file1)), mock.call(join('mocksavefolder', '2019', '2019-10-28', file2))])

    def test_download_data_dirs_not_exist(self):
        with mock.patch('api.update_predictions.download_data.make_knmi_requests.download_file') as mock_download_file, \
                mock.patch('os.path.exists') as mock_os_exists, mock.patch('pathlib.Path.write_bytes') as mock_write, \
                mock.patch('pathlib.Path.__init__') as mock_path, mock.patch('os.mkdir') as mock_os_makedir:
            timestamp1 = datetime.datetime(2020, 1, 1, 0, 0)
            file1 = 'RAD_NL25_PCP_NA_201901010000.h5'
            timestamp2 = datetime.datetime(2019, 12, 31, 23, 55)
            file2 = 'RAD_NL25_PCP_NA_201912312355.h5'

            urls = [('url1', file1, timestamp1), ('url2', file2, timestamp2)]

            mock_download_file.side_effect = lambda url: {'url1': (200, None, 32), 'url2': (200, None, 43)}[url]
            mock_os_exists.return_value = False
            mock_path.return_value = None

            download_radar_data.download_files(urls, 'mocksavefolder')

            mock_write.assert_has_calls([mock.call(32), mock.call(43)])
            mock_path.assert_has_calls([mock.call(join('mocksavefolder', '2020', '2020-01-01', file1)), mock.call(join('mocksavefolder', '2019', '2019-12-31', file2))])
            mock_os_makedir.assert_has_calls([mock.call('mocksavefolder'),
                                              mock.call(join('mocksavefolder', '2020')),
                                              mock.call(join('mocksavefolder', '2020', '2020-01-01')),
                                              mock.call('mocksavefolder'),
                                              mock.call(join('mocksavefolder', '2019')),
                                              mock.call(join('mocksavefolder', '2019', '2019-12-31'))])

    def test_download_data_url_wrong(self):
        with mock.patch('api.update_predictions.download_data.make_knmi_requests.download_file') as mock_download_file:

            with self.assertRaises(DownloadException):
                timestamp1 = datetime.datetime(2019, 10, 28, 11, 10)
                file1 = 'RAD_NL25_PCP_NA_201910281110.h5'
                timestamp2 = datetime.datetime(2019, 10, 28, 11, 5)
                file2 = 'RAD_NL25_PCP_NA_201910281105.h5'

                urls = [('url1', file1, timestamp1), ('url2', file2, timestamp2)]

                mock_download_file.side_effect = lambda url: {'url1': (404, 'File not found', None), 'url2': (404, 'File not found', None)}[url]

                download_radar_data.download_files(urls, 'mocksavefolder')

    def test_cleanup_files_remove_no_files(self):
        with mock.patch('os.listdir') as mock_os_listdir, mock.patch('shutil.rmtree') as mock_os_rmtree, \
                mock.patch('os.remove') as mock_os_remove:
            timestamp1 = datetime.datetime(2019, 10, 28, 11, 10)
            file1 = 'RAD_NL25_PCP_NA_201910281110.h5'
            mock_os_listdir.side_effect = lambda path: {'mocksavefolder': ['2019'],
                                                        join('mocksavefolder', '2019'): ['2019-10-28'],
                                                        join('mocksavefolder', '2019', '2019-10-28'): [file1]
                                                        }[path]

            download_radar_data.cleanup_files(timestamp1, 'mocksavefolder')

            mock_os_rmtree.assert_has_calls([])
            mock_os_remove.assert_has_calls([])

    def test_cleanup_files_remove_3_levels(self):
        with mock.patch('os.listdir') as mock_os_listdir, mock.patch('shutil.rmtree') as mock_os_rmtree, \
                mock.patch('os.remove') as mock_os_remove:
            timestamp1 = datetime.datetime(2019, 10, 28, 11, 10)
            file1 = 'RAD_NL25_PCP_NA_201910281110.h5'
            file2 = 'RAD_NL25_PCP_NA_201910281010.h5'
            mock_os_listdir.side_effect = lambda path: {'mocksavefolder': ['2018', '2019'],
                                                        join('mocksavefolder', '2019'): ['2019-10-27', '2019-10-28'],
                                                        join('mocksavefolder', '2019', '2019-10-28'): [file1, file2]
                                                        }[path]

            download_radar_data.cleanup_files(timestamp1, 'mocksavefolder')

            mock_os_rmtree.assert_has_calls([mock.call(join('mocksavefolder', '2018')),
                                             mock.call(join('mocksavefolder', '2019', '2019-10-27'))
                                             ])

            mock_os_remove.assert_has_calls([mock.call(join('mocksavefolder', '2019', '2019-10-28', file2))])

    def test_cleanup_files_remove_year_switch_1(self):
        with mock.patch('os.listdir') as mock_os_listdir, mock.patch('shutil.rmtree') as mock_os_rmtree, \
                mock.patch('os.remove') as mock_os_remove:
            timestamp1 = datetime.datetime(2020, 1, 1, 0, 5)
            file1 = 'RAD_NL25_PCP_NA_202001010005.h5'
            file2 = 'RAD_NL25_PCP_NA_201912312345.h5'
            file3 = 'RAD_NL25_PCP_NA_201912312340.h5'
            mock_os_listdir.side_effect = lambda path: {'mocksavefolder': ['2019', '2020'],
                                                        join('mocksavefolder', '2019'): ['2019-12-31'],
                                                        join('mocksavefolder', '2020'): ['2020-01-01'],
                                                        join('mocksavefolder', '2019', '2019-12-31'): [file2, file3],
                                                        join('mocksavefolder', '2020', '2020-01-01'): [file1]
                                                        }[path]

            download_radar_data.cleanup_files(timestamp1, 'mocksavefolder')

            mock_os_rmtree.assert_has_calls([])

            mock_os_remove.assert_has_calls([mock.call(join('mocksavefolder', '2019', '2019-12-31', file3))])

    def test_cleanup_files_remove_year_switch_2(self):
        with mock.patch('os.listdir') as mock_os_listdir, mock.patch('shutil.rmtree') as mock_os_rmtree, \
                mock.patch('os.remove') as mock_os_remove:
            timestamp1 = datetime.datetime(2020, 1, 1, 0, 30)
            file1 = 'RAD_NL25_PCP_NA_202001010030.h5'
            file2 = 'RAD_NL25_PCP_NA_201912312345.h5'
            file3 = 'RAD_NL25_PCP_NA_201912312340.h5'
            mock_os_listdir.side_effect = lambda path: {'mocksavefolder': ['2019', '2020'],
                                                        join('mocksavefolder', '2019'): ['2019-12-31'],
                                                        join('mocksavefolder', '2020'): ['2020-01-01'],
                                                        join('mocksavefolder', '2019', '2019-12-31'): [file2, file3],
                                                        join('mocksavefolder', '2020', '2020-01-01'): [file1]
                                                        }[path]

            download_radar_data.cleanup_files(timestamp1, 'mocksavefolder')

            mock_os_rmtree.assert_has_calls([mock.call(join('mocksavefolder', '2019'))])

            mock_os_remove.assert_has_calls([])

    def test_cleanup_files_remove_day_switch(self):
        with mock.patch('os.listdir') as mock_os_listdir, mock.patch('shutil.rmtree') as mock_os_rmtree, \
                mock.patch('os.remove') as mock_os_remove:
            timestamp1 = datetime.datetime(2020, 1, 3, 0, 30)
            file1 = 'RAD_NL25_PCP_NA_202001030030.h5'
            file2 = 'RAD_NL25_PCP_NA_202001022330.h5'
            mock_os_listdir.side_effect = lambda path: {'mocksavefolder': ['2020'],
                                                        join('mocksavefolder', '2020'): ['2020-01-02', '2020-01-03'],
                                                        join('mocksavefolder', '2020', '2020-01-03'): [file1],
                                                        join('mocksavefolder', '2020', '2020-01-02'): [file2]
                                                        }[path]

            download_radar_data.cleanup_files(timestamp1, 'mocksavefolder')

            mock_os_rmtree.assert_has_calls([mock.call(join('mocksavefolder', '2020', '2020-01-02'))])

            mock_os_remove.assert_has_calls([])

    def test_logger_download(self):
        with self.assertLogs(__name__, level='DEBUG') as upd:
            logger = logging.getLogger(__name__)
            logger.debug('test message')
            logger.warning('please be aware')
            self.assertEqual(upd.output,
                             ['DEBUG:api.tests.update_predictions.download_data.download_radar_data_test:test message',
                              'WARNING:api.tests.update_predictions.download_data.download_radar_data_test:please be aware'])

    def test_logger_empty(self):
        with self.assertLogs(__name__, level='WARNING') as upd:
            logger = logging.getLogger(__name__)
            logger.info('not visible')
            logger.error('visible')
            self.assertEqual(upd.output,
                             ['ERROR:api.tests.update_predictions.download_data.download_radar_data_test:visible'])
