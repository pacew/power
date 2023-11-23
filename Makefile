CFLAGS = -g -Wall
LIBS = -lopus -lm

WEB_FILES = power.php jquery-FIXME.js common.php style.css script.js \
	power-data.php

all: getpowerd

getpowerd: getpowerd.o
	$(CC) $(CFLAGS) -o getpowerd getpowerd.o $(LIBS)

.PHONY: web_files
web_files:
	@echo $(WEB_FILES)

install: all
	install -c -m 755 getpowerd /usr/local/bin
