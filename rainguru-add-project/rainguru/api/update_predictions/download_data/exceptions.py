# If any error occurs with regard to the downloading of data from KNMI, this exception is raised.
class DownloadException(Exception):
    def __init__(self, message):
        super()
        self.message = message
