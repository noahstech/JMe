var File = (function () {
    var that;
    var obj = function () {
        that = this;

        window.addEventListener("load", that._init, false);
    }

    obj.prototype = {
        upload: function (options) {
            that._initByOptions(options);
            that.fileInput.click();
        },

        _initByOptions: function (options) {
        	that.fileInput.value = "";
            that.options = {
                multi: false,
                url: "",
                accept: "",
                before: function () { },
                after: function () { },
                progress: function () { }
            };

            if (options) {
                for (var i in options) {
                    that.options[i] = options[i];
                }
            }

            // multiple
            if (that.options.multi) that.fileInput.setAttribute("multiple", "multiple");
            else that.fileInput.removeAttribute("multiple");

            // accept
            that.fileInput.setAttribute("accept", that.options.accept || "");
        },

        _init: function () {
            var ipt = document.createElement("input");
            ipt.style.display = "none";
            ipt.setAttribute("type", "file");
            ipt.addEventListener("change", that._fileChange, false);
            document.body.appendChild(ipt);

            that.fileInput = ipt;
        },

        _fileChange: function () {
            if (that.options.before) {
                var result = that.options.before(this.files);
                if (result == false) return;
            }
            
            for (var i = 0; i < this.files.length; i++) {
                that._uploadFile(this.files[i]);
            }
        },

        _uploadFile: function (file) {
            var xhr = new XMLHttpRequest();

            xhr.upload.addEventListener("progress", function (evt) {
                if (evt.lengthComputable) {
                    that.options.progress && that.options.progress(evt.loaded / evt.total);
                }
                else {
                    // No data to calculate on
                }
            }, false);

            xhr.addEventListener("load", function () {
                
            }, false);

            xhr.open("post", that.options.url);

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                        that.options.after && that.options.after(xhr.responseText, file);
                        xhr = null;
                    }
                }
            }

            // Send the file (doh)
            if ("getAsBinary" in file) {
                //FF 3.5+
                xhr.sendAsBinary(file.getAsBinary());
            } else {
				var formData = new FormData();
				formData.append("test.jpg", file);
                xhr.send(formData);
            }
        }
    }

    return new obj();
})();