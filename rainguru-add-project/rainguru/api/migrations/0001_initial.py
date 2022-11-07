# Generated by Django 4.0.4 on 2022-06-01 07:05

import datetime
import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Observed',
            fields=[
                ('time', models.DateTimeField(default=datetime.datetime(2022, 4, 18, 0, 0), primary_key=True, serialize=False)),
                ('matrix_data', django.contrib.postgres.fields.ArrayField(base_field=django.contrib.postgres.fields.ArrayField(base_field=models.DecimalField(decimal_places=2, max_digits=5), blank=True, size=None), default=list, size=None)),
            ],
        ),
        migrations.CreateModel(
            name='Predicted',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('calculation_time', models.DateTimeField()),
                ('prediction_time', models.DateTimeField()),
                ('matrix_data', django.contrib.postgres.fields.ArrayField(base_field=django.contrib.postgres.fields.ArrayField(base_field=models.DecimalField(decimal_places=2, max_digits=5), blank=True, size=None), default=list, size=None)),
            ],
        ),
    ]