# -*- coding: utf-8 -*-
from setuptools import setup, find_packages
from pip._internal.req import parse_requirements
import re
import ast

# get version from __version__ variable in switsol_ag/__init__.py
_version_re = re.compile(r'__version__\s+=\s+(.*)')

with open('switsol_ag/__init__.py', 'rb') as f:
    version = str(ast.literal_eval(_version_re.search(
        f.read().decode('utf-8')).group(1)))

requirements = parse_requirements("requirements.txt", session="")

setup(
    name='switsol_ag',
    version=version,
    description='Switsol Changes',
    author='Switsol AG',
    author_email='natalia.myshuk@switsol.ch',
    packages=find_packages(),
    zip_safe=False,
    include_package_data=True,
    install_requires=[str(ir.requirement) for ir in requirements], # change from ir.req to str(ir.requirement)
    dependency_links=[str(ir._link) for ir in requirements if ir._link]
)
