from picamera import PiCamera
import sys
from time import sleep

def main():

    try:
		camera = PiCamera()
		camera.start_preview()
		sleep(0.5)
		camera.capture('./image.jpg')
		camera.stop_preview()
    except Exception as PiCameraError:
        print("Error")
        raise PiCameraError('An error occuerred with the camera.')


if __name__ == "__main__":
    main()
