FROM dorowu/ubuntu-desktop-lxde-vnc

WORKDIR /root
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
RUN apt-get update -y
RUN curl -sL https://deb.nodesource.com/setup_14.x | sudo bash --
#RUN sh ./setup_14.sh
#RUN curl -s https://install.speedtest.net/app/cli/install.deb.sh | sudo bash
RUN apt-get install -y nano htop gnome-system-monitor nodejs
#RUN apt-get install -y nodejs
