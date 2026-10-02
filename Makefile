UUID = rut-empresa@asterion

.PHONY: pack clean

# Build the zip for extensions.gnome.org
pack:
	gnome-extensions pack --force --extra-source=indicator.js --extra-source=rut.js --extra-source=icons --extra-source=LICENSE .

clean:
	rm -f $(UUID).shell-extension.zip
