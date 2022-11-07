import requests
from decouple import config

api_url = "https://api.dataplatform.knmi.nl/open-data"
api_version = "v1"
dataset_name = "radar_reflectivity_composites"
dataset_version = "2.0"
api_key = config('API_KEY', default='')


def request_download_url(filename):
    """
    Requests the url of a specified file

    :param filename: the name of the file to download
    :returns: the status code, message and download url
    """
    response = requests.get(
        f"{api_url}/{api_version}/datasets/{dataset_name}/versions/{dataset_version}/files/{filename}/url",
        headers={"Authorization": api_key}
    )
    headers = response.headers
    content_type = str(headers['content-type'])
    if content_type != 'application/json':
        return response.status_code, '', ''
    return response.status_code, response.json().get('message'), response.json().get("temporaryDownloadUrl")


def download_file(url):
    """
    Downloads a file from a specified url

    :param url: The url to download the file from
    :return: The status code, message and byte content of the file
    """
    response = requests.get(url)
    headers = response.headers
    content_type = str(headers['content-type'])
    if content_type != 'application/json':
        return response.status_code, '', response.content
    return response.status_code, response.json().get('message'), response.content
