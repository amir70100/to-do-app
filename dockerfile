FROM python:3.14.8

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt /app/

RUN pip install --upgrade pip -i https://mirror2.chabokan.net/pypi/simple/ --trusted-host mirror2.chabokan.net

RUN pip install -r requirements.txt -i https://package-mirror.liara.ir/repository/pypi/simple --trusted-host package-mirror.liara.ir

COPY . /app

WORKDIR /app/core

EXPOSE 8000

