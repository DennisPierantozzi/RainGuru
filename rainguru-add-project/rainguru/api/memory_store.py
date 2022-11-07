from datetime import datetime


class Store:
    def __init__(self):
        self.exception_active = True
        self.exception_message = \
            'Server has just been restarted. Please wait for the predictions to be generated and stored'
        # Standard url if the server has just restarted and there are no predictions to fall back on.
        self.urls = ["/media/404.png" for x in range(20)]
        self.matrices = []
        self.predictions_timestamp = datetime.now()

    def store_predictions(self, urls, matrices, timestamp):
        """
        Store information about the latest data

        :param urls: The urls of the latest images
        :param matrices: The latest matrices that the model produced
        :param timestamp: The timestamp of the latest predictions
        """
        self.urls = urls
        self.matrices = matrices
        self.predictions_timestamp = timestamp

    def fetch_timestamp(self):
        return self.predictions_timestamp

    def fetch_urls(self):
        return self.urls, self.predictions_timestamp

    def fetch_matrices(self):
        return self.matrices

    def store_exception(self, message):
        self.exception_active = True
        self.exception_message = message

    def remove_exception(self):
        self.exception_active = False
        self.exception_message = ''

    def is_exception_active(self):
        return self.exception_active

    def get_exception_message(self):
        return self.exception_message


memory_store = Store()



