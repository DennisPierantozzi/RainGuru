import datetime
import os


def create_filename(timestamp):
    """
    Creates a filename in the KNMI format from a timestamp.
    For example 2019-10-28 11:10 -> RAD_NL25_PCP_NA_201910281110.h5

    :param timestamp: The timestamp to convert to a filename
    :return: The filename
    """
    start = 'RAD_NL25_PCP_NA_'
    end = '.h5'

    year = str(timestamp.year)
    month = str(timestamp.month).zfill(2)
    day = str(timestamp.day).zfill(2)
    hour = str(timestamp.hour).zfill(2)
    minute = str(timestamp.minute).zfill(2)

    return start + year + month + day + hour + minute + end


def create_filename_path(timestamp):
    """
    Creates a path from the root data folder to the file.
    For example 2019-10-28 11:10 -> 2019-10-28/RAD_NL25_PCP_NA_201910281110.h5

    :param timestamp: The timestamp to convert to a filename
    :return: The path to the file
    """
    return os.path.join(get_date_path(timestamp), create_filename(timestamp))




# Gets a filename in KNMI format and extracts the timestamp.
# For example RAD_NL25_PCP_NA_201910281110.h5 -> 2019-10-28 11:10
def get_timestamp(filename):
    """
    Gets a filename in KNMI format and extracts the timestamp.
    For example RAD_NL25_PCP_NA_201910281110.h5 -> 2019-10-28 11:10

    :param filename: The name of the file
    :return: The extracted timestamp
    """
    start = 'RAD_NL25_PCP_NA_'
    end = '.h5'
    timestring = filename[len(start):(len(filename) - len(end))]
    assert len(timestring) == 12 and timestring.isdigit()

    year = int(timestring[0:4])
    month = int(timestring[4:6])
    day = int(timestring[6:8])
    hour = int(timestring[8:10])
    minute = int(timestring[10:12])

    return datetime.datetime(year, month, day, hour, minute)


def round_timestamp(timestamp):
    """
    Round a timestamp down to a five minute interval

    :param timestamp: The timestamp to round
    :return: The rounded timestamp
    """
    return datetime.datetime(timestamp.year, timestamp.month, timestamp.day, timestamp.hour,
                             timestamp.minute - timestamp.minute % 5)


def get_date_path(timestamp):
    """
    Convert a timestamp into a path in the format that the model uses

    :param timestamp: The timestamp to convert
    :return: The path that the model uses
    """
    return os.path.join(str(timestamp.year), get_date_string(timestamp))


def get_date_string(timestamp):
    """
    Convert a timestamp into a string in the format that the model uses

    :param timestamp: The timestamp to convert
    :return: The string that the model uses
    """
    return str(timestamp.year) + '-' + str(timestamp.month).zfill(2) + '-' + str(timestamp.day).zfill(2)

