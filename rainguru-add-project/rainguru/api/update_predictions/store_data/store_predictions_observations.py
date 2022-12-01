import datetime
import os
import shutil

from api.memory_store import memory_store
from api.models import Predicted, Observed
from api.update_predictions.convert_data import convert_matrix_image
from django import db

store_data = True

def get_store_data():
    return store_data


def store_predictions(forecast, used, now):
    """
    Stores predictions and used frames

    :param forecast: The frames that represent the forecast
    :param used: The frames that represent the observations
    :param now: The timestamp of the latest observation
    """
    print('Store forecast images...')
    store_forecast_images(forecast, now)
    
    if store_data:
        print('Store observed...')
        store_observed(used, now)
        print('Store forecast in database...')
        store_forecast_database(forecast, now)

    print('Clean up...')
    #cleanup(now)


def store_forecast_images(forecast, now):
    """
    Converts the forecast to images and stores the urls and timestamp in the memory store.

    :param forecast: The frames that represent the forecast
    :param now: The timestamp of the latest observation
    """
    forecast_list = forecast.tolist()

    urls = []

    image_save_folder = os.path.join('media', 'predicted', str(now).replace(':', '_'))
    image_save_folder_path = os.path.join(os.getcwd(), image_save_folder)

    # Create a directory for the current time.
    if not os.path.exists(image_save_folder_path):
        os.mkdir(image_save_folder_path)

    for index in range(len(forecast_list)):
        location = os.path.join(image_save_folder, 'prediction' + str(index).zfill(2) + '.png')
        convert_matrix_image.create_image(forecast_list[index], location)
        urls.append(location)

    memory_store.store_predictions(urls, forecast_list, now + datetime.timedelta(minutes=5))


def store_forecast_database(forecast, now):
    """
    Stores the forecast in the database

    :param forecast: The frames that represent the forecast
    :param now: The timestamp of the latest observation
    """

    for t in range(len(forecast)):
        p = Predicted()
        p.calculation_time = now
        # Added the + 1 since the first prediction is 5 min into the future
        p.prediction_time = (now + datetime.timedelta(minutes=(t + 1) * 5))
        # Only store in database if it does not already exist
        if not Predicted.objects.filter(calculation_time=p.calculation_time,
                                        prediction_time=p.prediction_time).exists():
            print(f'calculation time: {p.calculation_time} con prediction time: {p.prediction_time}')
            p.matrix_data = forecast[t].tolist()
            p.save()
        db.reset_queries()


def store_observed(observed, now):
    """
    Stores observations in the database and on disk as images

    :param observed: The frames that represent the observations
    :param now: The timestamp of the latest observation
    """
    store_observed_images(observed, now)
    store_observed_database(observed, now) 


def store_observed_database(observed, now):
    """
    Stores observations in the database

    :param observed: The frames that represent the observations
    :param now: The timestamp of the latest observation
    """
    start = now - datetime.timedelta(minutes=20)

    for t in range(len(observed)):
        o = Observed()
        
        o.time = (start + datetime.timedelta(minutes=t * 5))
        # Only store it if no other object with the same time exists
        print(f'{t} con observed time {o.time}')
        if not Observed.objects.filter(time=o.time).exists():
            # Add [0][0] because the shape was (1, 1, 480, 480) for some reason
            o.matrix_data = observed[t][0][0].tolist()
            o.save()
    db.reset_queries()


def store_observed_images(observed, now):
    """
    Converts the observations to images and stores them on disk

    :param observed: The frames that represent the observations
    :param now: The timestamp of the latest observation
    """
    observed_images_path = os.path.join(os.getcwd(), 'media', 'observed')
    images_list = os.listdir(observed_images_path)

    start = now - datetime.timedelta(minutes=20)

    for t in range(len(observed)):
        file_name = str(start + datetime.timedelta(minutes=t*5)).replace(':', '_') + '.png'

        if file_name not in images_list:
            location = os.path.join(observed_images_path, file_name)
            convert_matrix_image.create_image(observed[t][0][0], location)


def store_previous_data_clicked(timestamp, observed):
    if observed:
        if not timestamp == memory_store.fetch_timestamp_obs():
            print("entrato in storing for observation")
            store_previous_observation(timestamp)

    elif not observed:
        if not timestamp == memory_store.fetch_timestamp_pred():
            print("entrato in storing for predictions")
            store_previous_predictions(timestamp)



def store_previous_observation(timestamp):
    matrices = []
    for o in Observed.objects\
            .filter(time__gte=timestamp)\
            .filter(time__lt=timestamp + datetime.timedelta(minutes=100))\
            .order_by('time'):
            
            matrices.append(o.matrix_data)

    memory_store.store_observation_clicked(matrices, timestamp)

def store_previous_predictions(timestamp):
    matrices = []
    for p in Predicted.objects.filter(calculation_time=timestamp).order_by('prediction_time'):
        matrices.append(p.matrix_data)
        
    memory_store.store_predictions_clicked(matrices, timestamp)


def cleanup(now):
    """
    Cleans up the database records and disk stored images of old predictions and observations

    :param now: The timestamp of the latest observation.
    """
    cleanup_observed_images(now)
    cleanup_prediction_images(now)
    cleanup_observed_database(now)
    cleanup_predictions_database(now)


def cleanup_observed_images(now):
    """
    Cleans up old observed images stored on disk

    :param now: The timestamp of the latest observation.
    """
    observed_images_path = os.path.join(os.getcwd(), 'media', 'observed')
    images_list = os.listdir(observed_images_path)

    for file_name in images_list:
        if file_name == 'placeholder.txt':
            continue
        file_path = os.path.join(observed_images_path, file_name)
        if store_data:
            if datetime.datetime.strptime(file_name[:19].replace('_', ':'), "%Y-%m-%d %H:%M:%S") < \
                    now - datetime.timedelta(days=1):
                os.remove(file_path)
        else:
            os.remove(file_path)


def cleanup_prediction_images(now):
    """
    Cleans up old prediction images stored on disk

    :param now: The timestamp of the latest observation.
    """
    predicted_images_path = os.path.join(os.getcwd(), 'media', 'predicted')
    times_list = os.listdir(predicted_images_path)

    for dir_name in times_list:
        if dir_name == 'placeholder.txt':
            continue
        dir_path = os.path.join(predicted_images_path, dir_name)
        if store_data:
            if datetime.datetime.strptime(dir_name[:19].replace('_', ':'), "%Y-%m-%d %H:%M:%S") < \
                    now - datetime.timedelta(days=1):
                shutil.rmtree(dir_path)
        else:
            if datetime.datetime.strptime(dir_name[:19].replace('_', ':'), "%Y-%m-%d %H:%M:%S") < now:
                shutil.rmtree(dir_path)


def cleanup_observed_database(now):
    """
    Cleans up old observed database records

    :param now: The timestamp of the latest observation.
    """
    if store_data:
        Observed.objects.filter(time__lt=now - datetime.timedelta(days=1)).delete()
    else:
        Observed.objects.all().delete()
    db.reset_queries()


def cleanup_predictions_database(now):
    """
    Cleans up old predicted database records

    :param now: The timestamp of the latest observation.
    """
    if store_data:
        Predicted.objects.filter(calculation_time__lt=now - datetime.timedelta(days=1)).delete()
    else:
        Predicted.objects.all().delete()
    db.reset_queries()
