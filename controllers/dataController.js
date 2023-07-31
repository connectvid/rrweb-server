"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.instantiate = exports.ParseErrorCode = void 0;
var ParseErrorCode = {
  SyntaxError: "BABEL_PARSER_SYNTAX_ERROR",
  SourceTypeModuleError: "BABEL_PARSER_SOURCETYPE_MODULE_REQUIRED",
};
exports.ParseErrorCode = ParseErrorCode;
const reflect = (keys, last = keys.length - 1) => ({
  get() {
    return keys.reduce((object, key) => object[key], this);
  },
  set(value) {
    keys.reduce(
      (item, key, i) => (i === last ? (item[key] = value) : item[key]),
      this
    );
  },
});

exports.encode = function base64VLQ_encode(aValue) {
  var encoded = "";
  var digit;

  var vlq = toVLQSigned(aValue);

  do {
    digit = vlq & VLQ_BASE_MASK;
    vlq >>>= VLQ_BASE_SHIFT;
    if (vlq > 0) {
      // There are still more digits in this value, so we must make sure the
      // continuation bit is marked.
      digit |= VLQ_CONTINUATION_BIT;
    }
    encoded += base64.encode(digit);
  } while (vlq > 0);

  return encoded;
};

var urlRegexp =
  /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.]*)(?::(\d+))?(\S*)$/;
var dataUrlRegexp = /^data:.+\,.+$/;

function urlParse(aUrl) {
  var match = aUrl.match(urlRegexp);
  if (!match) {
    return null;
  }
  return {
    scheme: match[1],
    auth: match[2],
    host: match[3],
    port: match[4],
    path: match[5],
  };
}
exports.urlParse = urlParse;

function urlGenerate(aParsedUrl) {
  var url = "";
  if (aParsedUrl.scheme) {
    url += aParsedUrl.scheme + ":";
  }
  url += "//";
  if (aParsedUrl.auth) {
    url += aParsedUrl.auth + "@";
  }
  if (aParsedUrl.host) {
    url += aParsedUrl.host;
  }
  if (aParsedUrl.port) {
    url += ":" + aParsedUrl.port;
  }
  if (aParsedUrl.path) {
    url += aParsedUrl.path;
  }
  return url;
}
exports.urlGenerate = urlGenerate;

function toSetString(aStr) {
  if (isProtoString(aStr)) {
    return "$" + aStr;
  }

  return aStr;
}
exports.toSetString = supportsNullProto ? identity : toSetString;

ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
  var sStr = hasNativeMap ? aStr : util.toSetString(aStr);
  var isDuplicate = hasNativeMap ? this.has(aStr) : has.call(this._set, sStr);
  var idx = this._array.length;
  if (!isDuplicate || aAllowDuplicates) {
    this._array.push(aStr);
  }
  if (!isDuplicate) {
    if (hasNativeMap) {
      this._set.set(aStr, idx);
    } else {
      this._set[sStr] = idx;
    }
  }
};

function fromSetString(aStr) {
  if (isProtoString(aStr)) {
    return aStr.slice(1);
  }

  return aStr;
}
exports.fromSetString = supportsNullProto ? identity : fromSetString;

var util = __webpack_require__(4);
var binarySearch = __webpack_require__(8);
var ArraySet = __webpack_require__(5).ArraySet;
var base64VLQ = __webpack_require__(2);
var quickSort = __webpack_require__(9).quickSort;

function SourceMapConsumer(aSourceMap) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === "string") {
    sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ""));
  }

  return sourceMap.sections != null
    ? new IndexedSourceMapConsumer(sourceMap)
    : new BasicSourceMapConsumer(sourceMap);
}

SourceMapConsumer.fromSourceMap = function (aSourceMap) {
  return BasicSourceMapConsumer.fromSourceMap(aSourceMap);
};
function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
  var context = aContext || null;
  var order = aOrder || SourceMapConsumer.GENERATED_ORDER;

  var mappings;
  switch (order) {
    case SourceMapConsumer.GENERATED_ORDER:
      mappings = this._generatedMappings;
      break;
    case SourceMapConsumer.ORIGINAL_ORDER:
      mappings = this._originalMappings;
      break;
    default:
      throw new Error("Unknown order of iteration.");
  }
  SourceNode.prototype.toStringWithSourceMap =
    function SourceNode_toStringWithSourceMap(aArgs) {
      var generated = {
        code: "",
        line: 1,
        column: 0,
      };
      var map = new SourceMapGenerator(aArgs);
      var sourceMappingActive = false;
      var lastOriginalSource = null;
      var lastOriginalLine = null;
      var lastOriginalColumn = null;
      var lastOriginalName = null;
      this.walk(function (chunk, original) {
        generated.code += chunk;
        if (
          original.source !== null &&
          original.line !== null &&
          original.column !== null
        ) {
          if (
            lastOriginalSource !== original.source ||
            lastOriginalLine !== original.line ||
            lastOriginalColumn !== original.column ||
            lastOriginalName !== original.name
          ) {
            map.addMapping({
              source: original.source,
              original: {
                line: original.line,
                column: original.column,
              },
              generated: {
                line: generated.line,
                column: generated.column,
              },
              name: original.name,
            });
          }
          lastOriginalSource = original.source;
          lastOriginalLine = original.line;
          lastOriginalColumn = original.column;
          lastOriginalName = original.name;
          sourceMappingActive = true;
        } else if (sourceMappingActive) {
          map.addMapping({
            generated: {
              line: generated.line,
              column: generated.column,
            },
          });
          lastOriginalSource = null;
          sourceMappingActive = false;
        }
        for (var idx = 0, length = chunk.length; idx < length; idx++) {
          if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
            generated.line++;
            generated.column = 0;
            // Mappings end at eol
            if (idx + 1 === length) {
              lastOriginalSource = null;
              sourceMappingActive = false;
            } else if (sourceMappingActive) {
              map.addMapping({
                source: original.source,
                original: {
                  line: original.line,
                  column: original.column,
                },
                generated: {
                  line: generated.line,
                  column: generated.column,
                },
                name: original.name,
              });
            }
          } else {
            generated.column++;
          }
        }
      });
      this.walkSourceContents(function (sourceFile, sourceContent) {
        map.setSourceContent(sourceFile, sourceContent);
      });

      return { code: generated.code, map: map };
    };

  var sourceRoot = this.sourceRoot;
  mappings
    .map(function (mapping) {
      var source =
        mapping.source === null ? null : this._sources.at(mapping.source);
      if (source != null && sourceRoot != null) {
        source = util.join(sourceRoot, source);
      }
      return {
        source: source,
        generatedLine: mapping.generatedLine,
        generatedColumn: mapping.generatedColumn,
        originalLine: mapping.originalLine,
        originalColumn: mapping.originalColumn,
        name: mapping.name === null ? null : this._names.at(mapping.name),
      };
    }, this)
    .forEach(aCallback, context);
}

SourceMapConsumer.prototype.__originalMappings = null;
Object.defineProperty(SourceMapConsumer.prototype, "_originalMappings", {
  get: function () {
    if (!this.__originalMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__originalMappings;
  },
});

function IndexedSourceMapConsumer(aSourceMap) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === "string") {
    sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ""));
  }

  var version = util.getArg(sourceMap, "version");
  var sections = util.getArg(sourceMap, "sections");

  if (version != this._version) {
    throw new Error("Unsupported version: " + version);
  }

  this._sources = new ArraySet();
  this._names = new ArraySet();

  var lastOffset = {
    line: -1,
    column: 0,
  };
  this._sections = sections.map(function (s) {
    if (s.url) {
      // The url field will require support for asynchronicity.
      // See https://github.com/mozilla/source-map/issues/16
      throw new Error("Support for url field in sections not implemented.");
    }
    var offset = util.getArg(s, "offset");
    var offsetLine = util.getArg(offset, "line");
    var offsetColumn = util.getArg(offset, "column");

    if (
      offsetLine < lastOffset.line ||
      (offsetLine === lastOffset.line && offsetColumn < lastOffset.column)
    ) {
      throw new Error("Section offsets must be ordered and non-overlapping.");
    }
    lastOffset = offset;

    return {
      generatedOffset: {
        // The offset fields are 0-based, but we use 1-based indices when
        // encoding/decoding from VLQ.
        generatedLine: offsetLine + 1,
        generatedColumn: offsetColumn + 1,
      },
      consumer: new SourceMapConsumer(util.getArg(s, "map")),
    };
  });
}

IndexedSourceMapConsumer.prototype.generatedPositionFor =
  function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      // Only consider this section if the requested source is in the list of
      // sources of the consumer.
      if (
        section.consumer.sources.indexOf(util.getArg(aArgs, "source")) === -1
      ) {
        continue;
      }
      var generatedPosition = section.consumer.generatedPositionFor(aArgs);
      if (generatedPosition) {
        var ret = {
          line:
            generatedPosition.line +
            (section.generatedOffset.generatedLine - 1),
          column:
            generatedPosition.column +
            (section.generatedOffset.generatedLine === generatedPosition.line
              ? section.generatedOffset.generatedColumn - 1
              : 0),
        };
        return ret;
      }
    }

    return {
      line: null,
      column: null,
    };
  };

IndexedSourceMapConsumer.prototype._parseMappings =
  function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    this.__generatedMappings = [];
    this.__originalMappings = [];
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];
      var sectionMappings = section.consumer._generatedMappings;
      for (var j = 0; j < sectionMappings.length; j++) {
        var mapping = sectionMappings[j];

        var source = section.consumer._sources.at(mapping.source);
        if (section.consumer.sourceRoot !== null) {
          source = util.join(section.consumer.sourceRoot, source);
        }
        this._sources.add(source);
        source = this._sources.indexOf(source);

        var name = section.consumer._names.at(mapping.name);
        this._names.add(name);
        name = this._names.indexOf(name);

        // The mappings coming from the consumer for the section have
        // generated positions relative to the start of the section, so we
        // need to offset them to be relative to the start of the concatenated
        // generated file.
        var adjustedMapping = {
          source: source,
          generatedLine:
            mapping.generatedLine + (section.generatedOffset.generatedLine - 1),
          generatedColumn:
            mapping.generatedColumn +
            (section.generatedOffset.generatedLine === mapping.generatedLine
              ? section.generatedOffset.generatedColumn - 1
              : 0),
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name: name,
        };

        this.__generatedMappings.push(adjustedMapping);
        if (typeof adjustedMapping.originalLine === "number") {
          this.__originalMappings.push(adjustedMapping);
        }
      }
    }

    quickSort(
      this.__generatedMappings,
      util.compareByGeneratedPositionsDeflated
    );
    quickSort(this.__originalMappings, util.compareByOriginalPositions);
  };

SourceNode.fromStringWithSourceMap =
  function SourceNode_fromStringWithSourceMap(
    aGeneratedCode,
    aSourceMapConsumer,
    aRelativePath
  ) {
    // The SourceNode we want to fill with the generated code
    // and the SourceMap
    var node = new SourceNode();

    // All even indices of this array are one line of the generated code,
    // while all odd indices are the newlines between two adjacent lines
    // (since `REGEX_NEWLINE` captures its match).
    // Processed fragments are accessed by calling `shiftNextLine`.
    var remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
    var remainingLinesIndex = 0;
    var shiftNextLine = function () {
      var lineContents = getNextLine();
      // The last line of a file might not have a newline.
      var newLine = getNextLine() || "";
      return lineContents + newLine;

      function getNextLine() {
        return remainingLinesIndex < remainingLines.length
          ? remainingLines[remainingLinesIndex++]
          : undefined;
      }
    };

    // We need to remember the position of "remainingLines"
    var lastGeneratedLine = 1,
      lastGeneratedColumn = 0;

    // The generate SourceNodes we need a code range.
    // To extract it current and last mapping is used.
    // Here we store the last mapping.
    var lastMapping = null;

    aSourceMapConsumer.eachMapping(function (mapping) {
      if (lastMapping !== null) {
        // We add the code from "lastMapping" to "mapping":
        // First check if there is a new line in between.
        if (lastGeneratedLine < mapping.generatedLine) {
          // Associate first line with "lastMapping"
          addMappingWithCode(lastMapping, shiftNextLine());
          lastGeneratedLine++;
          lastGeneratedColumn = 0;
          // The remaining code is added without mapping
        } else {
          // There is no new line in between.
          // Associate the code between "lastGeneratedColumn" and
          // "mapping.generatedColumn" with "lastMapping"
          var nextLine = remainingLines[remainingLinesIndex];
          var code = nextLine.substr(
            0,
            mapping.generatedColumn - lastGeneratedColumn
          );
          remainingLines[remainingLinesIndex] = nextLine.substr(
            mapping.generatedColumn - lastGeneratedColumn
          );
          lastGeneratedColumn = mapping.generatedColumn;
          addMappingWithCode(lastMapping, code);
          // No more remaining code, continue
          lastMapping = mapping;
          return;
        }
      }
      // We add the generated code until the first mapping
      // to the SourceNode without any mapping.
      // Each line is added as separate string.
      while (lastGeneratedLine < mapping.generatedLine) {
        node.add(shiftNextLine());
        lastGeneratedLine++;
      }
      if (lastGeneratedColumn < mapping.generatedColumn) {
        var nextLine = remainingLines[remainingLinesIndex];
        node.add(nextLine.substr(0, mapping.generatedColumn));
        remainingLines[remainingLinesIndex] = nextLine.substr(
          mapping.generatedColumn
        );
        lastGeneratedColumn = mapping.generatedColumn;
      }
      lastMapping = mapping;
    }, this);
    // We have processed all mappings.
    if (remainingLinesIndex < remainingLines.length) {
      if (lastMapping) {
        // Associate the remaining code in the current line with "lastMapping"
        addMappingWithCode(lastMapping, shiftNextLine());
      }
      // and add the remaining lines without any mapping
      node.add(remainingLines.splice(remainingLinesIndex).join(""));
    }

    // Copy sourcesContent into SourceNode
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        if (aRelativePath != null) {
          sourceFile = util.join(aRelativePath, sourceFile);
        }
        node.setSourceContent(sourceFile, content);
      }
    });

    return node;

    function addMappingWithCode(mapping, code) {
      if (mapping === null || mapping.source === undefined) {
        node.add(code);
      } else {
        var source = aRelativePath
          ? util.join(aRelativePath, mapping.source)
          : mapping.source;
        node.add(
          new SourceNode(
            mapping.originalLine,
            mapping.originalColumn,
            source,
            code,
            mapping.name
          )
        );
      }
    }
  };

SourceMapConsumer.prototype._charIsMappingSeparator =
  function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
    var c = aStr.charAt(index);
    return c === ";" || c === ",";
  };

function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
  this.children = [];
  this.sourceContents = {};
  this.line = aLine == null ? null : aLine;
  this.column = aColumn == null ? null : aColumn;
  this.source = aSource == null ? null : aSource;
  this.name = aName == null ? null : aName;
  this[isSourceNode] = true;
  if (aChunks != null) this.add(aChunks);
}

exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
  if (aHaystack.length === 0) {
    return -1;
  }

  var index = recursiveSearch(
    -1,
    aHaystack.length,
    aNeedle,
    aHaystack,
    aCompare,
    aBias || exports.GREATEST_LOWER_BOUND
  );
  if (index < 0) {
    return -1;
  }

  // We have found either the exact element, or the next-closest element than
  // the one we are searching for. However, there may be more than one such
  // element. Make sure we always return the smallest of these.
  while (index - 1 >= 0) {
    if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
      break;
    }
    --index;
  }

  return index;
};
exports.decode = function base64VLQ_decode(aStr, aIndex, aOutParam) {
  var strLen = aStr.length;
  var result = 0;
  var shift = 0;
  var continuation, digit;

  do {
    if (aIndex >= strLen) {
      throw new Error("Expected more digits in base 64 VLQ value.");
    }

    digit = base64.decode(aStr.charCodeAt(aIndex++));
    if (digit === -1) {
      throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
    }

    continuation = !!(digit & VLQ_CONTINUATION_BIT);
    digit &= VLQ_BASE_MASK;
    result = result + (digit << shift);
    shift += VLQ_BASE_SHIFT;
  } while (continuation);

  aOutParam.value = fromVLQSigned(result);
  aOutParam.rest = aIndex;
};
IndexedSourceMapConsumer.prototype.originalPositionFor =
  function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util.getArg(aArgs, "line"),
      generatedColumn: util.getArg(aArgs, "column"),
    };

    // Find the section containing the generated position we're trying to map
    // to an original position.
    var sectionIndex = binarySearch.search(
      needle,
      this._sections,
      function (needle, section) {
        var cmp = needle.generatedLine - section.generatedOffset.generatedLine;
        if (cmp) {
          return cmp;
        }

        return needle.generatedColumn - section.generatedOffset.generatedColumn;
      }
    );
    var section = this._sections[sectionIndex];

    if (!section) {
      return {
        source: null,
        line: null,
        column: null,
        name: null,
      };
    }

    return section.consumer.originalPositionFor({
      line: needle.generatedLine - (section.generatedOffset.generatedLine - 1),
      column:
        needle.generatedColumn -
        (section.generatedOffset.generatedLine === needle.generatedLine
          ? section.generatedOffset.generatedColumn - 1
          : 0),
      bias: aArgs.bias,
    });
  };

const instantiate = (constructor, properties, descriptors) =>
  Object.keys(descriptors)
    .map((key) => [key, descriptors[key]])
    .filter(([, descriptor]) => !!descriptor)
    .map(([key, descriptor]) => [
      key,
      typeof descriptor === "function"
        ? {
            value: descriptor,
            enumerable: false,
          }
        : typeof descriptor.reflect === "string"
        ? Object.assign({}, descriptor, reflect(descriptor.reflect.split(".")))
        : descriptor,
    ])
    .reduce(
      (instance, [key, descriptor]) =>
        Object.defineProperty(
          instance,
          key,
          Object.assign(
            {
              configurable: true,
            },
            descriptor
          )
        ),
      Object.assign(new constructor(), properties)
    );
exports.instantiate = instantiate;
