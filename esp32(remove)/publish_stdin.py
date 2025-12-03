#!/usr/bin/env python3
"""
publish_stdin.py

Read lines from stdin (or a single message arg) and publish to AWS IoT MQTT topic
using certificate-based TLS. Designed to work with the certs you have under
%USERPROFILE%\.aws\certs mounted or available locally.

Usage examples (PowerShell):

# Publish a single JSON message from echo:
# echo '{"temperature":25}' | python .\esp32\publish_stdin.py --endpoint a2v6h6fq7j6lhc-ats.iot.eu-central-1.amazonaws.com --topic ECE334B3BE68/telemetry --cert %USERPROFILE%\\.aws\\certs\\6f91ab05...-certificate.pem.crt --key %USERPROFILE%\\.aws\\certs\\6f91ab05...-private.pem.key --ca %USERPROFILE%\\.aws\\certs\\AmazonRootCA1.pem

# Or run interactively and type lines (Ctrl+Z then Enter to end on Windows):
# python .\esp32\publish_stdin.py --endpoint ... --topic ... --cert ... --key ... --ca ...

"""
import argparse
import ssl
import sys
import time
import logging

import paho.mqtt.client as mqtt

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s: %(message)s')


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument('--endpoint', required=True, help='AWS IoT endpoint (without https://)')
    p.add_argument('--topic', required=True, help='MQTT topic to publish to')
    p.add_argument('--cert', required=True, help='Path to device certificate (PEM)')
    p.add_argument('--key', required=True, help='Path to device private key (PEM)')
    p.add_argument('--ca', required=True, help='Path to Root CA PEM')
    p.add_argument('--client-id', default='esp32-cli-pub', help='MQTT client id')
    p.add_argument('--qos', type=int, default=1, choices=[0,1], help='MQTT QoS')
    return p.parse_args()


def on_connect(client, userdata, flags, rc):
    if rc == 0:
        logging.info('Connected to %s', userdata['endpoint'])
    else:
        logging.error('MQTT connect failed rc=%s', rc)


def main():
    args = parse_args()

    client = mqtt.Client(client_id=args.client_id)
    client.on_connect = on_connect
    client.user_data_set({'endpoint': args.endpoint})

    client.tls_set(ca_certs=args.ca, certfile=args.cert, keyfile=args.key, tls_version=ssl.PROTOCOL_TLSv1_2)
    client.tls_insecure_set(False)

    logging.info('Connecting to %s:8883', args.endpoint)
    client.connect(args.endpoint, port=8883, keepalive=60)
    client.loop_start()

    try:
        if not sys.stdin.isatty():
            # piped input or echo
            for line in sys.stdin:
                msg = line.strip()
                if not msg:
                    continue
                r = client.publish(args.topic, payload=msg, qos=args.qos)
                logging.info('Published: %s (rc=%s)', msg, r.rc)
                time.sleep(0.1)
        else:
            # interactive mode
            logging.info('Interactive mode — type messages and press Enter (Ctrl+Z then Enter to finish)')
            while True:
                try:
                    line = input('> ')
                except EOFError:
                    break
                msg = line.strip()
                if not msg:
                    continue
                r = client.publish(args.topic, payload=msg, qos=args.qos)
                logging.info('Published: %s (rc=%s)', msg, r.rc)
    except KeyboardInterrupt:
        pass
    finally:
        client.loop_stop()
        client.disconnect()


if __name__ == '__main__':
    main()
