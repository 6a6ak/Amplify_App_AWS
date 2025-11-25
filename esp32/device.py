import os
import ssl
import time
import logging
from pathlib import Path

import paho.mqtt.client as mqtt

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s: %(message)s')


def get_env(name, default=None):
    v = os.environ.get(name)
    return v if v is not None else default


IOT_ENDPOINT = get_env('AWS_IOT_ENDPOINT')
CLIENT_ID = get_env('CLIENT_ID', 'esp32-sim-1')
CA_PATH = get_env('CA_PATH', '/certs/AmazonRootCA1.pem')
CERT_PATH = get_env('CERT_PATH', '/certs/certificate.pem.crt')
KEY_PATH = get_env('KEY_PATH', '/certs/private.pem.key')
TOPIC = get_env('TOPIC', 'esp32/test')
QOS = int(get_env('QOS', '1'))


def on_connect(client, userdata, flags, rc):
    if rc == 0:
        logging.info('Connected to AWS IoT Core (rc=%s)', rc)
        client.subscribe(TOPIC, qos=QOS)
    else:
        logging.error('Connection failed with code %s', rc)


def on_message(client, userdata, msg):
    logging.info('Received message on %s: %s', msg.topic, msg.payload.decode())


def main():
    if not IOT_ENDPOINT:
        logging.error('Environment variable AWS_IOT_ENDPOINT is required')
        return

    for p in (CA_PATH, CERT_PATH, KEY_PATH):
        if not Path(p).exists():
            logging.error('Certificate file not found: %s', p)
            return

    client = mqtt.Client(client_id=CLIENT_ID)
    client.on_connect = on_connect
    client.on_message = on_message

    client.tls_set(ca_certs=CA_PATH,
                   certfile=CERT_PATH,
                   keyfile=KEY_PATH,
                   tls_version=ssl.PROTOCOL_TLSv1_2)
    client.tls_insecure_set(False)

    logging.info('Connecting to %s:8883 as %s', IOT_ENDPOINT, CLIENT_ID)
    try:
        client.connect(IOT_ENDPOINT, port=8883, keepalive=60)
    except Exception as e:
        logging.error('Error connecting: %s', e)
        return

    client.loop_start()

    try:
        i = 0
        while True:
            payload = f'{{"message": "hello from esp32-sim", "count": {i}}}'
            result = client.publish(TOPIC, payload, qos=QOS)
            logging.info('Published to %s: %s (mid=%s)', TOPIC, payload, result.mid)
            i += 1
            time.sleep(5)
    except KeyboardInterrupt:
        logging.info('Interrupted, stopping')
    finally:
        client.loop_stop()
        client.disconnect()


if __name__ == '__main__':
    main()
