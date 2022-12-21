import datetime
import json
import math

from api import service
from django.http import HttpResponse, HttpResponseBadRequest

def fetch_precipitation(request):
    """
    Returns the precipitation at a given point for a certain time range
    If no timestamp is provided, this method will use the latest data

    :param request: An Http request that contains the following (optional) parameters:
    - x Int: a value between 0 and 700 to indicate the x coordinate of the image pixel.
    - y Int: a value between 0 and 700 to indicate the y coordinate of the image pixel.
    - observed Boolean: whether we want to use observed or predicted data
    - timestamp Timestamp: (optional) The timestamp at which the predictions were made.
    :return: The precipitation array
    """
    x = request.GET.get('x')
    y = request.GET.get('y')

    if x is None or y is None:
        return HttpResponseBadRequest("x or y parameter missing!")

    observed = request.GET.get('observed')
    compare = request.GET.get('compare')
    provided_timestamp = request.GET.get('timestamp')

    if provided_timestamp is None:
        response_dict = service.fetch_latest_predicted_precipitation(int(x), int(y))
    else:
        if compare == 'true':
            times = provided_timestamp.split('c')
            response_dict = service.fetch_compare_precipitation(datetime.datetime.utcfromtimestamp(int(times[0])), datetime.datetime.utcfromtimestamp(int(times[1])), int(x), int(y))
        else:
            timestamp = datetime.datetime.utcfromtimestamp(int(provided_timestamp))
            if observed == 'true':
                response_dict = service.fetch_observed_precipitation(timestamp, int(x), int(y))
            else:
                response_dict = service.fetch_predicted_precipitation(timestamp, int(x), int(y))

    return HttpResponse(json.dumps(response_dict))


def fetch_urls(request):
    """
    Fetches the following information:
    - Urls of the images for the requested timestamp
    - The timestamp of the first prediction
    - Whether there is currently an active exception
    - The message of the current exception (If there is one)
    If no timestamp is provided, this method will use the latest data


    :param request: Http GET request with the following (optional) parameters
    - observed Boolean: whether we want to show observed or predicted data
    - timestamp Timestamp: The timestamp of when a certain set of predictions/observations were made.

    :return: An Http response with the information in json format
    """
    observed = request.GET.get('observed')
    provided_timestamp = request.GET.get('timestamp')
    compare = request.GET.get('compare')
    x = request.GET.get('x')
    y = request.GET.get('y')

    if observed is None:
        return HttpResponseBadRequest("observed parameter missing!")

    if provided_timestamp is None:
        response_dict = service.fetch_latest_urls()
        if not (math.isnan(float(x))) and not (math.isnan(float(y))): 
            responsePrecipitation = service.fetch_latest_predicted_precipitation(int(x), int(y)) 
            response_dict['precipitation']=responsePrecipitation['precipitation']
    else:
        if not request.session.exists(request.session.session_key):
            request.session.create()

        if compare == 'false':
            timestamp = datetime.datetime.utcfromtimestamp(int(provided_timestamp))

        if observed == 'true' and compare == 'false':

            response_dict = service.fetch_observed_urls(timestamp)

            if not (math.isnan(float(x))) and not (math.isnan(float(y))): 
                responsePrecipitation = service.fetch_observed_precipitation(timestamp, int(x), int(y))
                response_dict['precipitation']=responsePrecipitation['precipitation']
             
        elif observed == 'false' and compare == 'false':

            response_dict = service.fetch_predicted_urls(timestamp)

            if not (math.isnan(float(x))) and not (math.isnan(float(y))): 
                responsePrecipitation = service.fetch_predicted_precipitation(timestamp, int(x), int(y))
                response_dict['precipitation']=responsePrecipitation['precipitation']

        if compare == 'true':
            times = provided_timestamp.split('c')
            response_dict = service.fetch_compare_urls(datetime.datetime.utcfromtimestamp(int(times[0])), datetime.datetime.utcfromtimestamp(int(times[1])))

    return HttpResponse(json.dumps(response_dict))


def get_data_availability(request):
    """
    Returns the following information: whether the server is storing data, what predictions have been stored and what
    observations have been stored

    :param request: An http request
    :return: An http response with the information in json format
    """
    response_dict = service.get_data_availability()

    return HttpResponse(json.dumps(response_dict))


def check_new_data(request):
    """
    Fetches timestamp of the latest data

    :param request: An http request
    :return: the timestamp of the latest data
    """
    response_dict = service.check_new_data()

    return HttpResponse(json.dumps(response_dict))