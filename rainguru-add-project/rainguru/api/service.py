import datetime
import json
import math
import os
from datetime import timezone
from json import JSONEncoder

import numpy as np
from api.memory_store import memory_store
from api.models import Observed, Predicted
from api.update_predictions.convert_data import convert_matrix_image
from api.update_predictions.scheduler import restart, stop
from api.update_predictions.store_data import store_predictions_observations


def get_precipitations_array(x, y, observed):
    precipitation = []
    data = []
    if observed:
        data = memory_store.fetch_matrices_obs()
    else: data = memory_store.fetch_matrices_pred()

    for matrix in data:
            if x == -1:
                value = 0
            else:
                value = matrix[y][x]

            rounded = math.floor(value * 100) / 100

            precipitation.append(rounded)
    
    return precipitation


def fetch_observed_precipitation(timestamp, passx, passy):
    """
    Fetch observed precipitation at a given point from the database

    :param timestamp: The timestamp of the first observation
    :param x: The x coordinate of the image pixel
    :param y: The y coordinate of the image pixel
    :return: An array of 20 observed precipitation values, starting at the given timestamp
    """
    x, y = convert_matrix_image.image_map[(passx, passy)]
    precipitation = []
    precipitationOne = []
    
    if memory_store.fetch_timestamp_obs() == timestamp:
        print("entrato in store observation clicked")
        precipitation = get_precipitations_array(x, y, True)

    else:
        for o in Observed.objects\
                    .filter(time__gte=timestamp)\
                    .filter(time__lt=timestamp + datetime.timedelta(minutes=100))\
                    .order_by('time'):

            if x == -1:
                    value = 0
            else:
                    value = o.matrix_data[y][x]

            rounded = math.floor(value * 100) / 100
            precipitationOne.append(rounded)
        print("precipitation database: " + str(precipitationOne))

    response_dict = {
        'precipitation': precipitation,
    }

    return response_dict


def fetch_latest_predicted_precipitation(x, y):
    """
    Fetch latest precipitation at a given point

    :param x: The x coordinate of the image pixel
    :param y: The y coordinate of the image pixel
    :return: The latest array of 20 predicted precipitation values
    """
    x, y = convert_matrix_image.image_map[(x, y)]
    precipitation = []
    for matrix in memory_store.fetch_matrices():
        if x == -1:
            value = 0
        else:
            value = matrix[y][x]

        rounded = math.floor(value * 100) / 100

        precipitation.append(rounded)

    response_dict = {
        'precipitation': precipitation
    }

    return response_dict


def fetch_predicted_precipitation(timestamp, x, y):
    """
    Fetch predicted precipitation at a given point from the database

    :param timestamp: The timestamp at which the predictions were made
    :param x: The x coordinate of the image pixel
    :param y: The y coordinate of the image pixel
    :return: An array of 20 predicted precipitation values which were calculated at the given timestamp
    """
    x, y = convert_matrix_image.image_map[(x, y)]
    precipitation = []

    if memory_store.fetch_timestamp_pred() == timestamp:
        print("entrato in store predictions clicked")
        precipitation = get_precipitations_array(x, y, False)

    else:
        for p in Predicted.objects.filter(calculation_time=timestamp).order_by('prediction_time'):
            if x == -1:
                value = 0
            else:
                value = p.matrix_data[y][x]

            rounded = math.floor(value * 100) / 100

            precipitation.append(rounded)

    response_dict = {
        'precipitation': precipitation
    }

    return response_dict

def fetch_compare_precipitation(timestamp, x, y):
    """
    Fetch predicted precipitation at a given point from the database

    :param timestamp: The timestamp at which the predictions were made
    :param x: The x coordinate of the image pixel
    :param y: The y coordinate of the image pixel
    :return: An array of 20 predicted precipitation values which were calculated at the given timestamp
    """
    x, y = convert_matrix_image.image_map[(x, y)]
    precipitation = []

    if memory_store.fetch_timestamp_compare_clicked() == timestamp and memory_store.fetch_observed_clicked() == -1:
        precipitation = get_precipitations_array(x, y, True)

    response_dict = {
        'precipitation': precipitation
    }

    return response_dict


def fetch_observed_urls(timestamp):
    """
    Fetches urls of observed images

    :param timestamp: The timestamp of the first required observation
    :return: A dictionary with the urls, timestamp and exceptions
    """
    observed_folder = os.path.join('media', 'observed')
    observed_path = os.path.join(os.getcwd(), observed_folder)
    urls = []
    for observed_name in sorted(os.listdir(observed_path)):
        if observed_name == 'placeholder.txt':
            continue
        observed_time = datetime.datetime.strptime(observed_name[:19], "%Y-%m-%d %H_%M_%S")
        if timestamp <= observed_time < timestamp + datetime.timedelta(minutes=100):
            urls.append(os.path.join(observed_folder, observed_name))

    response_dict = {
        "urls": urls,
        "timestamp": timestamp.replace(tzinfo=timezone.utc).timestamp(),
        "exception_active": False,
        "exception_message": ''
    }

    store_predictions_observations.store_previous_data_clicked(timestamp, True)

    return response_dict


def fetch_latest_urls():
    """
    Fetches urls of latest prediction images

    :return: A dictionary with the urls, timestamp and exceptions
    """
    urls, timestamp = memory_store.fetch_urls()
    exception_message = memory_store.get_exception_message()
    exception_active = memory_store.is_exception_active()

    response_dict = {
        'urls': urls,
        'timestamp': timestamp.replace(tzinfo=timezone.utc).timestamp(),
        'exception_active': exception_active,
        'exception_message': exception_message
    }

    return response_dict


def fetch_predicted_urls(timestamp):
    """
    Fetches urls of predicted images

    :param timestamp: The timestamp at which the predictions were calculated
    :return: A dictionary with the urls, timestamp and exceptions
    """
    predicted_folder = os.path.join('media', 'predicted', str(timestamp).replace(":", "_"))
    predicted_path = os.path.join(os.getcwd(), predicted_folder)

    urls = []
    for prediction in sorted(os.listdir(predicted_path)):
        urls.append(os.path.join(predicted_folder, prediction))

    response_dict = {
        "urls": urls,
        "timestamp": (timestamp + datetime.timedelta(minutes=5)).replace(tzinfo=timezone.utc).timestamp(),
        "exception_active": False,
        "exception_message": ''
    }

    store_predictions_observations.store_previous_data_clicked(timestamp, False)

    return response_dict

def fetch_compare_urls(timestamp_obs, timestamp_pred):
    """
    Fetches urls of predicted images

    :param timestamp: The timestamp at which the predictions were calculated
    :return: A dictionary with the urls, timestamp and exceptions
    """
    dict_obs = fetch_observed_urls(timestamp_obs)
    dict_prep = fetch_predicted_urls(timestamp_pred)

    response_dict = {
                "urls_observation": dict_obs["urls"],
                "urls_precipitation": dict_prep["urls"],
                "timestamp_observation": dict_obs["timestamp"],
                "timestamp_precipitation": dict_prep["timestamp"],
                "exception_active_observation": dict_obs["exception_active"],
                "exception_active_precipitation": dict_prep["exception_active"],
                "exception_message_observation": dict_obs["exception_message"],
                "exception_message_precipitation": dict_prep["exception_message"],
    }

    #store_predictions_observations.store_previous_data_clicked(timestamp_obs, -1, timestamp_pred)

    return response_dict


def get_data_availability():
    """
    Returns the following information: whether the server is storing data, what predictions have been stored and what
    observations have been stored

    :return: An http response with the information in json format
    """
    predicted_path = os.path.join(os.getcwd(), 'media', 'predicted')
    predictions_stored = []
    for prediction_folder in sorted(os.listdir(predicted_path)):
        if prediction_folder == 'placeholder.txt':
            continue
        timestamp = datetime.datetime.strptime(prediction_folder.replace('_', ':'), "%Y-%m-%d %H:%M:%S")
        predictions_stored.append(timestamp.replace(tzinfo=timezone.utc).timestamp())

    observed_path = os.path.join(os.getcwd(), 'media', 'observed')
    observations_stored = []
    for observed_name in sorted(os.listdir(observed_path)):
        if observed_name == 'placeholder.txt':
            continue
        timestamp = datetime.datetime.strptime(observed_name[:19].replace('_', ':'), "%Y-%m-%d %H:%M:%S")
        observations_stored.append(timestamp.replace(tzinfo=timezone.utc).timestamp())

    response_dict = {
        'store_data': store_predictions_observations.get_store_data(),
        'predictions_stored': predictions_stored,
        'observations_stored': observations_stored
    }

    return response_dict


def check_new_data():
    """
    Fetches timestamp of the latest data

    :return: the timestamp of the latest data
    """
    response_dict = {
        'timestamp': memory_store.fetch_timestamp().replace(tzinfo=timezone.utc).timestamp()
    }

    return response_dict


def handle_update(update):
    if update=='true': restart()
    if update=='false': stop()

    response_dict = {
        'update': update
    }
    return response_dict