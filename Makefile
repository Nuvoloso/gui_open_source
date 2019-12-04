# Copyright 2019 Tad Lebeck
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

.PHONY: all build

all: build

# variables needed for managing certs
# assumes all non-golang src is rooted together
CP=cp
MKDIR=mkdir
CAT=cat
CERTS=certs
SERVICES_NODE=services-node
TOOLS_REPO=../tools
TOOLS_CERTS=$(TOOLS_REPO)/$(CERTS)
SSL_DIR=$(SERVICES_NODE)/ssl
CA_CRT=ca.crt
GUI_CRT=gui.crt
GUI_KEY=gui.key
WEBSERVICE_CRT=webservice.crt
WEBSERVICE_KEY=webservice.key
MAX_WARNINGS=0
ESLINT=node_modules/.bin/eslint

LOG_TIMESTAMP_FILE=$(SERVICES_NODE)/src/logTimestamp.js


BUILD_TIME := $(shell date +%FT%T%z)
BUILD_ID := $(shell git rev-parse HEAD)
BUILD_JOB := $(JOB_NAME):$(BUILD_NUMBER)

log_timestamp:
	@echo "export const LOG_TIMESTAMP =\"Version [$(BUILD_ID) $(BUILD_TIME) $(BUILD_JOB)]\"" > $(LOG_TIMESTAMP_FILE)

# make a local copy of certs and install required items into the runtime directory for the UI
copy_certs:
	$(strip if [ ! -d $(CERTS) ]; then \
		$(CP) -r $(TOOLS_CERTS) $(CERTS); \
	fi)

install_certs:
	$(MKDIR) -p services-node/ssl
	$(CP) $(CERTS)/$(GUI_CRT) $(SSL_DIR)/client.crt
	$(CP) $(CERTS)/$(GUI_KEY) $(SSL_DIR)/client.key
	$(CP) $(CERTS)/$(WEBSERVICE_CRT) $(SSL_DIR)/server.crt
	$(CP) $(CERTS)/$(WEBSERVICE_KEY) $(SSL_DIR)/server.key
	$(CP) $(CERTS)/$(CA_CRT) $(SSL_DIR)/

lint:
	cd slog && $(ESLINT) --max-warnings $(MAX_WARNINGS) src
	cd services-node && $(ESLINT) --max-warnings $(MAX_WARNINGS) src

node_install:
	cd slog && npm install
	cd services-node && npm install

build: log_timestamp node_install lint copy_certs install_certs
ifdef NODE_ENV
	$(error "Cannot build with NODE_ENV set.  'unset' the variable and retry.");
endif
	cd slog && npm run langs
	cd services-node && npm run build

run:
	cd services-node && API_PORT=8443 npm run start

archive:
	cd services-node && rm -rf node_modules
	cd services-node && npm install --production
	mkdir -p deploy/gui
	tar czf deploy/gui/archive.tgz services-node

# don't delete all our modules during development
archive_dev:
	mkdir -p deploy/gui
	tar czf deploy/gui/archive.tgz services-node

clean::
	$(RM) -r $(SSL_DIR)
	$(RM) -rf services-node/node_modules slog/node_modules
	$(RM) -r certs
	$(RM) $(LOG_TIMESTAMP_FILE)

test:
	cd slog && CI=true npm run test

CONTAINER_TAG?=latest
container_build:
	docker build -t 407798037446.dkr.ecr.us-west-2.amazonaws.com/nuvoloso/webservice:$(CONTAINER_TAG) --file=deploy/Dockerfile.gui .

container_push:
	docker push 407798037446.dkr.ecr.us-west-2.amazonaws.com/nuvoloso/webservice:$(CONTAINER_TAG)

container: build archive_dev container_build container_push

container_local:
	docker build -t webservice:$(CONTAINER_TAG) --file=deploy/Dockerfile.gui .

