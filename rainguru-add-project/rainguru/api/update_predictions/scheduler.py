import datetime
from api.logger.log_configuration import create_log
from apscheduler.schedulers.background import BackgroundScheduler

mainLogger = create_log(__name__)
background_scheduler = BackgroundScheduler()

def start():
    """
    Starts the scheduler
    """
    # Only import this after apps have been loaded.
    from api.update_predictions import updater
    mainLogger.info("Server is starting")
    background_scheduler.add_job(updater.update, 'interval', minutes=5, id='udpate_pred')
    # Add job so that server updates the predictions 3 seconds after starting.
    background_scheduler.add_job(updater.update, 'date',
                                 run_date=(datetime.datetime.now() + datetime.timedelta(seconds=3)), id='update_date')
    background_scheduler.start()


def stop():
    background_scheduler.remove_job('udpate_pred')
    

def restart():
    from api.update_predictions import updater
    background_scheduler.add_job(updater.update, 'interval', minutes=5, id='udpate_pred')
    background_scheduler.add_job(updater.update, 'date',
                                 run_date=(datetime.datetime.now() + datetime.timedelta(seconds=3)), id='update_date')
