from django.test import SimpleTestCase
import logging
import mock

from api.logger import log_configuration
from django.test import SimpleTestCase
from logging.handlers import TimedRotatingFileHandler
from manage import ROOT_DIR


class LogConfigurationTestCase(SimpleTestCase):

    def test_create_logger(self):
        with mock.patch('api.logger.log_configuration.create_log') as mock_log:
            expected = logging.getLogger('root')
            logfile = ROOT_DIR + '/logfiles/log_out'
            fh = TimedRotatingFileHandler(logfile, when="midnight", interval=1, backupCount=5)
            formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s', '%d-%b-%y %H:%M:%S')
            fh.setFormatter(formatter)
            expected.addHandler(fh)
            expected.propagate = False

            mock_log.return_value = expected

            result = log_configuration.create_log('root')
            self.assertEqual(expected, result)

