import os
from setuptools import setup

here = os.path.abspath(os.path.dirname(__file__))
README = open(os.path.join(here, 'README.rst')).read()

setup(
    name='DjangoS3Browser',
    version='0.2',
    packages=['djangoS3Browser', 'djangoS3Browser.s3_browser',
              'djangoS3Browser.templatetags'],
    include_package_data=True,
    description='S3 browser for django',
    long_description=README,
    author='mkaykisiz',
    author_email='m.kaykisiz@gmail.com',
    url='https://github.com/mkaykisiz/DjangoS3Browser',
    license='MIT',
    install_requires=[
        'Django>=1.9',
        'boto3==1.4.6',
    ]
)
