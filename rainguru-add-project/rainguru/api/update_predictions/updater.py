import datetime
import os
import sys

from api.memory_store import memory_store
from api.update_predictions.store_data import store_predictions_observations
from api.update_predictions.download_data import download_radar_data
from api.update_predictions.download_data.exceptions import DownloadException
from api.update_predictions.scheduler import mainLogger

# This has to be added to the environment variables before importing to make sure the import does not throw an exception
sys.path.append(os.path.join(os.path.abspath(os.curdir), 'api', 'prediction_model'))
from api.prediction_model.generate_model_output import run_model


logger = mainLogger

model_input_folder = os.path.join(os.path.abspath(os.curdir), 'api', 'model_input')

use_latest_data = True

def update():
    """
    Execute the update pipeline. Download the latest data, run it through the model and store it.
    """
    update_start = datetime.datetime.now()
    print('Update (' + str(update_start) + ')')
    utc_now = datetime.datetime.utcnow()

    start_timestamp, latest_timestamp, successful = try_download(utc_now)

    if not successful:
        return

    print('Run model...')
    if use_latest_data:
        forecast, used = run_model(start_timestamp, model_input_folder)
    else:
        forecast, used = run_model('2022-11-23 12:00:00',
                                   model_input_folder)
        #forecast, used = run_model('2022-11-08 14:05:00',
        #                           os.path.join(os.getcwd(), 'api', 'tests', 'model_input_test_data'))
    print('Model has finished running!')

    print("Store predictions...")
    store_predictions_observations.store_predictions(forecast, used, latest_timestamp)
    print('Predictions stored!')

    print('Update finished! (Time elapsed: ' + str(datetime.datetime.now() - update_start) + ')')
    logger.info('Update finished in ' + str(datetime.datetime.now() - update_start) + ' hours')


def try_download(utc_now):
    """
    :param utc_now: a timestamp of the current time in the utc timezone.

    :returns: the oldest and newest timestamp of downloaded files together with a boolean indicating
    whether the download was successful.
    """
    # Only download the latest data if not running with test data
    if use_latest_data:
        print('Start download...')
        try:
            start_timestamp, latest_timestamp = download_radar_data.download(utc_now, model_input_folder)
            print('Download successful!')
            memory_store.remove_exception()
            return start_timestamp, latest_timestamp, True
        except DownloadException as e:
            print('Download failed!')
            logger.warning('Data download failed and update aborted')
            print(getattr(e, 'message'))
            memory_store.store_exception(getattr(e, 'message'))
            print("Abort update ===========")
            return 0, 0, False
    else:
        print("Using test data, so no download!")
        return datetime.datetime(2018, 6, 1, 13, 35), datetime.datetime(2018, 6, 1, 13, 55), True


# This method is here for testing purposes
def set_data_choice(use_latest):
    global use_latest_data
    use_latest_data = use_latest




