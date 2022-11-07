import logging
import logging.config

from logging.handlers import TimedRotatingFileHandler
from manage import ROOT_DIR


def create_log(logger_name):
    """
    param logger_name: the name of the file for which the logger will log events.

    returns: a logger that logs to the file log_out.log.
    """
    logger = logging.getLogger(logger_name)
    logger.setLevel(logging.DEBUG)

    logfile = ROOT_DIR+'/logfiles/log_out'
    fh = TimedRotatingFileHandler(logfile, when="midnight", interval=1, backupCount=5)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s', '%d-%b-%y %H:%M:%S')
    fh.setFormatter(formatter)
    logger.addHandler(fh)
    logger.propagate = False
    return logger
