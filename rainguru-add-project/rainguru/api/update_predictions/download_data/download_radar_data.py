import datetime
import os
import shutil

from api.update_predictions.download_data import make_knmi_requests
from api.update_predictions.download_data.exceptions import DownloadException
from api.update_predictions.download_data.file_date_utils import create_filename
from api.update_predictions.download_data.file_date_utils import get_date_path
from api.update_predictions.download_data.file_date_utils import round_timestamp
from api.update_predictions.download_data.file_date_utils import get_timestamp
from api.update_predictions.download_data.file_date_utils import create_filename_path
from api.update_predictions.download_data.file_date_utils import get_date_string
from api.update_predictions.scheduler import mainLogger
from pathlib import Path

logger = mainLogger


def download(now, save_folder):
    """
    Download the latest files, stores them and cleans up old files

    :param now: a timestamp of the current time
    :param save_folder: the folder in which the files should be stored

    :returns: the timestamps of the earliest and latest stored file
    """

    urls, latest_timestamp = fetch_urls(now, save_folder)
    download_files(urls, save_folder)
    start_timestamp = cleanup_files(latest_timestamp, save_folder)
    return start_timestamp, latest_timestamp


def fetch_urls(now, save_folder):
    """
    Fetches the download urls for the latest five files and returns the timestamp of the latest file.

    :param now: a timestamp of the current time.
    :param save_folder: the folder in which the files should be stored

    :returns: A list of urls of files to dowload and a timestamp of the latest file
    """
    latest_url, latest_filename, latest_timestamp = fetch_latest_url(now)
    timestamp = latest_timestamp - datetime.timedelta(minutes=5)
    urls = [(latest_url, latest_filename, latest_timestamp)]

    for i in range(4):
        filename = create_filename(timestamp)

        # Only request download url if file does not already exist
        if not os.path.exists(os.path.join(save_folder, create_filename_path(timestamp))):
            status_code, message, url = make_knmi_requests.request_download_url(filename)

            if status_code == 200:
                urls.append((url, filename, timestamp))
                logger.info('New file successfully downloaded from KNMI')
            elif status_code == 403:
                logger.error('Quota of amount of downloads exceeded')
                raise DownloadException('Quota exceeded!')
            else:
                logger.error('Error occurred while requesting url for following file: ' + filename)
                raise DownloadException('Error occurred while requesting url for following file: ' + filename +
                                        '\nmessage: ' + message)

        timestamp = timestamp - datetime.timedelta(minutes=5)

    return urls, latest_timestamp


def fetch_latest_url(now):
    """
    Finds the url of the latest file uploaded by KNMI by rounding the current time down to five minutes and tries to
    fetch the corresponding files. If the files does not exist, try a file that is five minutes older. Try this five
    times and throw an exception if no file can be fetched.

    :param now: a timestamp of the current time

    :returns: the url, filename and timestamp of the latest file downloaded
    """
    timestamp = round_timestamp(now)
    # Add max of five requests, otherwise KNMI might be down, and it will fill up the quota
    max_count = 5
    for count in range(max_count):
        filename = create_filename(timestamp)
        status_code, message, url = make_knmi_requests.request_download_url(filename)

        # If file is found
        if status_code == 200:
            return url, filename, timestamp
        # Quota exceeded
        elif status_code == 403:
            logger.error('Quota of amount of downloads exceeded')
            raise DownloadException('Quota exceeded!')
        # Something other than file not found
        elif status_code != 404:
            logger.error('Error occurred while requesting url for following file: ' + filename)
            raise DownloadException('Error occurred while requesting url for following file: ' + filename +
                                    '\nmessage: ' + message)

        # If file is not found, try a file of 5 min earlier
        timestamp = timestamp - datetime.timedelta(minutes=5)
    logger.warning('No file uploaded by knmi in previous ' + str(5 * max_count) + ' minutes')
    raise DownloadException('No file found of the previous ' + str(5 * max_count) + ' minutes')


def download_files(urls, save_folder):
    """
    Downloads the files from the urls given and stores them.

    :param urls: The urls to download the files from
    :param save_folder: the folder in which the files should be stored
    """
    for (url, filename, timestamp) in urls:
        status_code, message, content = make_knmi_requests.download_file(url)

        if status_code != 200:
            logger.error("Download url did not work: " + url)
            raise DownloadException("Download url did not work: " + url +
                                    "\nmessage: " + message)

        # Check whether the save directory already exists and otherwise create it.
        if not os.path.exists(save_folder):
            os.mkdir(save_folder)

        # Check whether year directory already exists and otherwise create it.
        dir_path = os.path.join(save_folder, str(timestamp.year))
        if not os.path.exists(dir_path):
            os.mkdir(dir_path)

        # Check whether date directory already exists and otherwise create it.
        dir_path = os.path.join(save_folder, get_date_path(timestamp))
        if not os.path.exists(dir_path):
            os.mkdir(dir_path)

        # Write the content to disk.
        p = Path(os.path.join(dir_path, filename))
        p.write_bytes(content)


def cleanup_files(latest_timestamp, save_folder):
    """
    Clean up the old files.

    :param latest_timestamp: A timestamp of the latest file downloaded
    :param save_folder: the folder in which the files should be stored
    :return: The timestamp of the earliest file that is still on disk
    """
    earliest_timestamp = latest_timestamp - datetime.timedelta(minutes=20)

    earliest_year = str(earliest_timestamp.year)
    latest_year = str(latest_timestamp.year)
    earliest_date = get_date_string(earliest_timestamp)
    latest_date = get_date_string(latest_timestamp)
    earliest_path = get_date_path(earliest_timestamp)
    latest_path = get_date_path(latest_timestamp)

    # If a year directory is older than the earliest timestamp, delete it.
    for year_dir in os.listdir(save_folder):
        if year_dir == 'placeholder.txt':
            os.remove(os.path.join(save_folder, year_dir))
            continue
        if not (year_dir == earliest_year or year_dir == latest_year):
            shutil.rmtree(os.path.join(save_folder, year_dir))
        # Same for date directories
        else:
            for date_dir in os.listdir(os.path.join(save_folder, year_dir)):
                if not (date_dir == earliest_date or date_dir == latest_date):
                    shutil.rmtree(os.path.join(save_folder, year_dir, date_dir))

    # Go into the oldest directory and delete all files with a timestamp before the earliest
    for file in os.listdir(os.path.join(save_folder, earliest_path)):
        if get_timestamp(file) < earliest_timestamp:
            os.remove(os.path.join(save_folder, earliest_path, file))
    return earliest_timestamp
