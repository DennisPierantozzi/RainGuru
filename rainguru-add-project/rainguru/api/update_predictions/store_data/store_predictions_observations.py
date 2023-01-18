import datetime
import os
import shutil
import numpy as np
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
    cleanup(now)


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
        location = os.path.join(image_save_folder, 'prediction' + str(index).zfill(2) + '.webp')
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
            p.matrix_data = forecast[t].tolist()
            p.matrix_data_fast = clean_matrix(forecast[t])
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
        if not Observed.objects.filter(time=o.time).exists():
            # Add [0][0] because the shape was (1, 1, 480, 480) for some reason
            o.matrix_data = observed[t][0][0].tolist()
            o.matrix_data_fast = clean_matrix(observed[t][0][0])
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
        file_name = str(start + datetime.timedelta(minutes=t*5)).replace(':', '_') + '.webp'

        if file_name not in images_list:
            location = os.path.join(observed_images_path, file_name)
            convert_matrix_image.create_image(observed[t][0][0], location)


def clean_matrix(f):
    """
    Stores the forecast in the database as json
    Only rows without zeros

    :param f: The frames that represent the forecast
    """

    jsonMatrix = {}
    
    #initialize index
    yindex = 0
    for y in f:
        ydecimal = np.round(np.array(y), 2)
        #get the non zero values for the row 
        x = np.nonzero(ydecimal)

        if x[0].size: # if there are nozero values
            
            jsonMatrix[yindex] = {}
            
            xlist = x[0].tolist() # list of x values to store
            
            values_non_zero = [round(elem, 3) for elem in ydecimal[np.nonzero(ydecimal)].tolist()] # the actual values to store
            
            # append values to the index 
            for xvalue in range(len(xlist)):
                jsonMatrix[yindex][xlist[xvalue]] = values_non_zero[xvalue]    
            
        yindex += 1
    return jsonMatrix
        

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
            print(file_name[:19].replace('_', ':'))
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
        Observed.objects.filter(time__lt=now - datetime.timedelta(days=2)).delete()
    else:
        Observed.objects.all().delete()
    db.reset_queries()


def cleanup_predictions_database(now):
    """
    Cleans up old predicted database records

    :param now: The timestamp of the latest observation.
    """
    if store_data:
        Predicted.objects.filter(calculation_time__lt=now - datetime.timedelta(days=2)).delete()
    else:
        Predicted.objects.all().delete()
    db.reset_queries()
