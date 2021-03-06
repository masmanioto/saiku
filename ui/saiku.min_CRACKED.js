var SaikuOlapQueryTemplate = {
  queryModel: {
   axes: {
    FILTER: {
     mdx: null,
     filters: [],
     sortOrder: null,
     sortEvaluationLiteral: null,
     hierarchizeMode: null,
     location: "FILTER",
     hierarchies: [],
     nonEmpty: !1
    },
    COLUMNS: {
     mdx: null,
     filters: [],
     sortOrder: null,
     sortEvaluationLiteral: null,
     hierarchizeMode: null,
     location: "COLUMNS",
     hierarchies: [],
     nonEmpty: !0
    },
    ROWS: {
     mdx: null,
     filters: [],
     sortOrder: null,
     sortEvaluationLiteral: null,
     hierarchizeMode: null,
     location: "ROWS",
     hierarchies: [],
     nonEmpty: !0
    }
   },
   visualTotals: !1,
   visualTotalsPattern: null,
   lowestLevelsOnly: !1,
   details: {
    axis: "COLUMNS",
    location: "BOTTOM",
    measures: []
   },
   calculatedMeasures: [],
   calculatedMembers: []
  },
  queryType: "OLAP",
  type: "QUERYMODEL"
 },
 SaikuOlapQueryHelper = function(a) {
  this.query = a
 };
SaikuOlapQueryHelper.prototype.model = function() {
 return this.query.model
};
SaikuOlapQueryHelper.prototype.clearAxis = function(a) {
 this.model().queryModel.axes[a].hierarchies = []
};
SaikuOlapQueryHelper.prototype.getHierarchy = function(a) {
 var b = function(b) {
   return b && b.name == a
  },
  c;
 for (c in this.model().queryModel.axes) {
  var d = this.model().queryModel.axes[c];
  if (d = _.find(d.hierarchies, b)) return d
 }
 return null
};
SaikuOlapQueryHelper.prototype.moveHierarchy = function(a, b, c, d) {
 c = this.getHierarchy(c);
 var e = this.model().queryModel.axes[a].hierarchies.indexOf(c);
 b = this.model().queryModel.axes[b].hierarchies;
 this.model().queryModel.axes[a].hierarchies.splice(e, 1);
 "undefined" != typeof d && -1 < d && b.length > d ? b.splice(d, 0, c) : b.push(c)
};
SaikuOlapQueryHelper.prototype.removeHierarchy = function(a) {
 var b = this.getHierarchy(a);
 if (!b) return null;
 if (a = this.findAxisForHierarchy(a)) {
  var c = a.hierarchies.indexOf(b);
  a.hierarchies.splice(c, 1)
 }
 return b
};
SaikuOlapQueryHelper.prototype.findAxisForHierarchy = function(a) {
 for (var b in this.model().queryModel.axes) {
  var c = this.model().queryModel.axes[b];
  if (c.hierarchies && 0 < c.hierarchies.length)
   for (var d = 0, e = c.hierarchies.length; d < e; d++)
    if (c.hierarchies[d].name == a) return c
 }
 return null
};
SaikuOlapQueryHelper.prototype.getAxis = function(a) {
 if (a in this.model().queryModel.axes) return this.model().queryModel.axes[a];
 Saiku.log("Cannot find axis: " + a)
};
SaikuOlapQueryHelper.prototype.removeFilter = function(a, b) {
 if (b && 1 < a.filters.length) {
  for (var c = -1, d = 0, e = a.filters.length; d < e; d++) a.filters[d].flavour == b && (c = d);
  c && 0 <= c && a.filters.splice(c, 0)
 } else a.filters = []
};
SaikuOlapQueryHelper.prototype.setDefaultFilter = function(a, b, c) {
 b = b.replace("[", "");
 b = b.replace("]", "");
 this.includeLevel("FILTER", a, b);
 a = this.getHierarchy(a).levels[b];
 a.selection = {
  type: "INCLUSION",
  members: []
 };
 a.selection.parameterName = "default_filter_" + b;
 this.model().parameters || (this.model().parameters = {});
 a = "default_filter_" + b;
 this.model().parameters[a] = c
};
SaikuOlapQueryHelper.prototype.getLevelForParameter = function(a) {
 var b, c = this.model().queryModel.axes;
 _.each(c, function(c) {
  _.each(c.hierarchies, function(c) {
   _.each(c.levels, function(d) {
    if (d.selection && d.selection.parameterName && d.selection.parameterName === a) return b = {
     hierarchy: c,
     level: d
    }, !1
   })
  })
 });
 return b
};
SaikuOlapQueryHelper.prototype.getSelectionsForParameter = function(a) {
 var b, c = this.model().queryModel.axes;
 _.each(c, function(c) {
  _.each(c.hierarchies, function(c) {
   _.each(c.levels, function(c) {
    if (c.selection && c.selection.parameterName && c.selection.parameterName === a) return b = c.selection.members, !1
   })
  })
 });
 return b
};
SaikuOlapQueryHelper.prototype.addtoSelection = function(a, b) {
 void 0 === b.level.selection.members && (b.selection.members = []);
 var c = !1;
 _.each(b.level.selection.members, function(d) {
  d.uniqueName == b.hierarchy.name + ".[" + b.level.name + "].[" + a + "]" && (c = !0)
 });
 c || b.level.selection.members.push({
  uniqueName: b.hierarchy.name + ".[" + b.level.name + "].[" + a + "]",
  caption: a
 })
};
SaikuOlapQueryHelper.prototype.includeCmember = function(a, b) {
 var c = this.getHierarchy(a);
 c && (c.cmembers[b] = b)
};
SaikuOlapQueryHelper.prototype.includeLevel = function(a, b, c, d) {
 var e = this.getHierarchy(b);
 e || (e = {
  name: b,
  levels: {},
  cmembers: {}
 });
 e.levels[c] = {
  name: c
 };
 var f = this.findAxisForHierarchy(b);
 f ? this.moveHierarchy(f.location, a, b, d) : (b = this.model().queryModel.axes[a]) ? "undefined" != typeof d && -1 < d && b.hierarchies.length > d ? b.hierarchies.splice(d, 0, e) : b.hierarchies.push(e) : Saiku.log("Cannot find axis: " + a + " to include Level: " + c)
};
SaikuOlapQueryHelper.prototype.includeLevelCalculatedMember = function(a, b, c, d, e) {
 var f = this.getHierarchy(b);
 f || (f = {
  name: b,
  levels: {},
  cmembers: {}
 });
 f.cmembers[d] = d;
 (d = this.findAxisForHierarchy(b)) ? this.moveHierarchy(d.location, a, b, -1): (b = this.model().queryModel.axes[a]) ? "undefined" != typeof e && -1 < e && b.hierarchies.length > e ? b.hierarchies.splice(e, 0, f) : b.hierarchies.push(f) : Saiku.log("Cannot find axis: " + a + " to include Level: " + c)
};
SaikuOlapQueryHelper.prototype.removeLevel = function(a, b) {
 (a = this.getHierarchy(a)) && a.levels.hasOwnProperty(b) && delete a.levels[b]
};
SaikuOlapQueryHelper.prototype.removeLevelCalculatedMember = function(a, b) {
 (a = this.getHierarchy(a)) && a.cmembers.hasOwnProperty(b) && delete a.cmembers[b]
};
SaikuOlapQueryHelper.prototype.removeAllLevelCalculatedMember = function(a) {
 a = this.getHierarchy(a);
 a.cmembers = {}
};
SaikuOlapQueryHelper.prototype.includeMeasure = function(a) {
 var b = this.model().queryModel.details.measures,
  c = b.length,
  d, e = !1;
 if (b && !_.isEmpty(b)) {
  for (d = 0; d < c; d++)
   if (b[d].name === a.name) {
    e = !0;
    break
   } else e = !1;
   !1 === e && b.push(a)
 } else b.push(a)
};
SaikuOlapQueryHelper.prototype.removeMeasure = function(a) {
 var b = this.query.model.queryModel.details.measures;
 (a = _.findWhere(b, {
  name: a
 })) && -1 < _.indexOf(b, a) && _.without(b, a)
};
SaikuOlapQueryHelper.prototype.clearMeasures = function() {
 this.model().queryModel.details.measures = []
};
SaikuOlapQueryHelper.prototype.setMeasures = function(a) {
 this.model().queryModel.details.measures = a
};
SaikuOlapQueryHelper.prototype.addCalculatedMeasure = function(a) {
 a && (this.removeCalculatedMeasure(a.name), this.model().queryModel.calculatedMeasures.push(a))
};
SaikuOlapQueryHelper.prototype.editCalculatedMeasure = function(a, b) {
 b && (this.removeCalculatedMeasure(a), this.removeCalculatedMember(a), this.model().queryModel.calculatedMeasures.push(b))
};
SaikuOlapQueryHelper.prototype.removeCalculatedMeasure = function(a) {
 var b = this.model().queryModel.calculatedMeasures;
 (a = _.findWhere(b, {
  name: a
 })) && -1 < _.indexOf(b, a) && (b = _.without(b, a), this.model().queryModel.calculatedMeasures = b)
};
SaikuOlapQueryHelper.prototype.getCalculatedMeasures = function() {
 var a = this.model().queryModel.calculatedMeasures;
 return a ? a : null
};
SaikuOlapQueryHelper.prototype.addCalculatedMember = function(a) {
 a && (this.removeCalculatedMember(a.name), this.model().queryModel.calculatedMembers.push(a))
};
SaikuOlapQueryHelper.prototype.editCalculatedMember = function(a, b) {
 b && (this.removeCalculatedMeasure(a), this.removeCalculatedMember(a), this.model().queryModel.calculatedMembers.push(b))
};
SaikuOlapQueryHelper.prototype.removeCalculatedMember = function(a) {
 var b = this.model().queryModel.calculatedMembers;
 (a = _.findWhere(b, {
  name: a
 })) && -1 < _.indexOf(b, a) && (b = _.without(b, a), this.model().queryModel.calculatedMembers = b)
};
SaikuOlapQueryHelper.prototype.getCalculatedMembers = function() {
 var a = this.model().queryModel.calculatedMembers;
 return a ? a : null
};
SaikuOlapQueryHelper.prototype.swapAxes = function() {
 var a = this.model().queryModel.axes,
  b = a.ROWS;
 b.location = "COLUMNS";
 a.ROWS = a.COLUMNS;
 a.ROWS.location = "ROWS";
 a.COLUMNS = b
};
SaikuOlapQueryHelper.prototype.nonEmpty = function(a) {
 a ? (this.model().queryModel.axes.ROWS.nonEmpty = !0, this.model().queryModel.axes.COLUMNS.nonEmpty = !0) : (this.model().queryModel.axes.ROWS.nonEmpty = !1, this.model().queryModel.axes.COLUMNS.nonEmpty = !1)
};
var DateFilterModel = Backbone.Model.extend({}),
 DateFilterCollection = Backbone.Collection.extend({
  model: DateFilterModel
 }),
 Level = Backbone.Model.extend({
  initialize: function(a, b) {
   b && !_.isEmpty(b) && (this.ui = b.ui, this.cube = b.cube, this.dimension = b.dimension, this.hierarchy = b.hierarchy)
  },
  url: function() {
   return Saiku.session.username + "/discover/" + this.cube + "/dimensions/" + this.dimension + "/hierarchies/" + this.hierarchy + "/levels"
  }
 }),
 LevelMember = Backbone.Model.extend({
  initialize: function(a, b) {
   b && !_.isEmpty(b) && (this.ui =
    b.ui, this.cube = b.cube, this.dimension = b.dimension, this.hierarchy = b.hierarchy, this.level = b.level)
  },
  url: function() {
   return Saiku.session.username + "/discover/" + this.cube + "/dimensions/" + this.dimension + "/hierarchies/" + this.hierarchy + "/levels/" + encodeURIComponent(this.level)
  }
 }),
 LevelChildMember = Backbone.Model.extend({
  initialize: function(a, b) {
   b && !_.isEmpty(b) && (this.ui = b.ui, this.cube = b.cube, this.uniqueName = b.uniqueName, this.levelUniqueName = b.levelUniqueName, this.mname = b.mname, this.mcaption = b.mcaption)
  },
  url: function() {
   return Saiku.session.username +
    "/discover/" + this.cube + "/member/" + encodeURIComponent(this.uniqueName) + "/children"
  }
 }),
 SaikuRendererOptions = {
  mode: null,
  dataMode: null,
  htmlObject: null,
  width: null,
  height: null
 },
 SaikuRenderer = function(a, b) {
  this._options = _.extend(SaikuRendererOptions, b);
  this._hasProcessed = !1;
  "undefined" !== typeof Backbone && _.extend(this, Backbone.Events);
  this.render = function(a, b) {
   var e = null;
   "undefined" !== typeof Backbone && this.trigger("render:start", this);
   this.hasProcessedData() || this.processData(a, b);
   e = this._render(a, b);
   "undefined" !==
   typeof Backbone && this.trigger("render:end", this);
   return e
  };
  this.processData = function(a, b) {
   "undefined" !== typeof Backbone && this.trigger("processData:start", this);
   this._processData(a, b);
   "undefined" !== typeof Backbone && this.trigger("processData:end", this)
  };
  this.hasProcessedData = function() {
   return this._hasProcessed
  };
  this._render = function(a, b) {};
  this._processData = function(a, b) {};
  a && (this._data = a, this.processData(a, b), this._hasProcessed = !0)
 };

function SaikuTableRenderer(a, b) {
 this._data = a;
 this._options = _.extend({}, SaikuRendererOptions, b)
}
SaikuTableRenderer.prototype.render = function(a, b) {
 var c = this;
 a && (this._data = a);
 b && (this._options = _.extend({}, SaikuRendererOptions, b));
 if ("undefined" != typeof this._data && !(null != this._data && null != this._data.error || null == this._data || this._data.cellset && 0 === this._data.cellset.length))
  if (this._options.htmlObject) c._options.hasOwnProperty("batch") && $(c._options.htmlObject).parent().parent().unbind("scroll"), _.defer(function(a) {
   c._options.hasOwnProperty("batch") && !c._options.hasOwnProperty("batchSize") &&
    (c._options.batchSize = 1E3);
   a = c.internalRender(c._data, c._options);
   $(c._options.htmlObject).html(a);
   _.defer(function(a) {
    if (c._options.hasOwnProperty("batch") && c._options.hasBatchResult) {
     var b = 0,
      d = !1,
      h = c._options.hasOwnProperty("batchIntervalSize") ? c._options.batchIntervalSize : 20;
     a = c._options.hasOwnProperty("batchIntervalTime") ? c._options.batchIntervalTime : 20;
     var k = c._options.batchResult.length,
      l = _.debounce(function() {
       if (!d && 0 < k && b < k) {
        d = !0;
        for (var a = "", e = b, l = 0; b < k && l < h; l++, b++) a += c._options.batchResult[b];
        b > e && $(c._options.htmlObject).append($(a));
        d = !1
       }
       b >= k && $(c._options.htmlObject).parent().parent().unbind("scroll")
      }, a);
     $(c._options.htmlObject).parent().parent().scroll(function() {
      l()
     })
    }
   });
   return a
  });
  else return this.internalRender(this._data, c._options)
};
SaikuTableRenderer.prototype.clear = function(a, b) {
 this._options && this._options.htmlObject && this._options.hasOwnProperty("batch") && $(this._options.htmlObject).parent().parent().unbind("scroll")
};
SaikuTableRenderer.prototype.processData = function(a, b) {
 this._hasProcessed = !0
};

function genTotalDataCells(a, b, c, d, e) {
 var f = "";
 e = e[ROWS];
 for (var g = c.length - 1; 0 <= g; g--)
  if (a == c[g]) {
   for (var h = e[g][d[g]], k = 0; k < h.cells.length; k++) f += '\x3ctd class\x3d"data total"\x3e' + h.cells[k][b].value + "\x3c/td\x3e";
   d[g]++;
   d[g] < e[g].length && (c[g] += e[g][d[g]].width)
  }
 return f
}

function genTotalHeaderCells(a, b, c, d, e, f) {
 for (var g = "", h = b; 0 <= h; h--)
  if (a == c[h]) {
   var k = e[h][d[h]],
    l;
   l = 0 == h && 1 == b ? "col" : h == b ? "col_total_corner" : h == b - 1 && k.captions ? "col_total_first" : "col_null";
   for (var m = 0; m < k.cells.length; m++) {
    var n = "\x26nbsp;";
    b == e.length - 1 && (k.captions && (n = e[h][d[h]].captions[m]), 0 == h && 0 == d[h] && (n = k.captions ? n + "\x26nbsp;" : "", n += f ? "\x3cspan class\x3d'i18n'\x3eGrand Total\x3c/span\x3e" : "Grand Total"));
    g += '\x3cth class\x3d"' + l + '"\x3e' + (f ? "\x3cdiv\x3e" + n + "\x3c/div\x3e" : n) + "\x3c/th\x3e"
   }
   d[h]++;
   d[h] < e[h].length && (c[h] += e[h][d[h]].width)
  }
 return g
}

function totalIntersectionCells(a, b, c, d, e) {
 for (var f = ""; 0 <= b; b--)
  if (a == c[b]) {
   for (var g = e[b][d[b]], h = 0; h < g.cells.length; h++) f += '\x3ctd class\x3d"data total"\x3e\x26nbsp;\x3c/td\x3e';
   d[b]++;
   d[b] < e[b].length && (c[b] += e[b][d[b]].width)
  }
 return f
}

function genTotalHeaderRowCells(a, b, c, d, e) {
 for (var f = d[COLUMNS], g = b[COLUMNS], h = c[COLUMNS], k = f.length - 2, l = "", m = k; 0 <= m; m--)
  if (a == g[m]) {
   for (var n = 0; n < f[m][h[m]].cells.length; n++) {
    l += "\x3ctr\x3e";
    for (b = 0; b <= k; b++) {
     var s = "\x26nbsp;";
     c = 0 == m && 0 == b ? "row" : m == b + 1 ? "row_total_corner" : m == b && f[m][h[m]].captions ? "row_total_first" : m < b + 1 ? "row_total" : "row_null";
     b == k && (f[m][h[m]].captions && (s = f[m][h[m]].captions[n]), 0 == m && 0 == h[m] && (s = f[m][h[m]].captions ? s + "\x26nbsp;" : "", s += e ? "\x3cspan class\x3d'i18n'\x3eGrand Total\x3c/span\x3e" :
      "Grand Total"));
     l += '\x3cth class\x3d"' + c + '"\x3e' + (e ? "\x3cdiv\x3e" + s + "\x3c/div\x3e" : s) + "\x3c/th\x3e"
    }
    c = {};
    b = {};
    for (s = 0; s < d[ROWS].length; s++) c[s] = 0, b[s] = d[ROWS][s][c[s]].width;
    for (s = 0; s < f[m][h[m]].cells[n].length; s++) l += '\x3ctd class\x3d"data total"\x3e' + f[m][h[m]].cells[n][s].value + "\x3c/td\x3e", l += totalIntersectionCells(s + 1, d[ROWS].length - 1, b, c, d[ROWS]);
    l += "\x3c/tr\x3e"
   }
   h[m]++;
   h[m] < f[m].length && (g[m] += f[m][h[m]].width)
  }
 return l
}
var ROWS = "ROWS",
 COLUMNS = "COLUMNS";

function nextParentsDiffer(a, b, c) {
 for (; 0 < b--;)
  if (a[b][c].properties.uniquename != a[b][c + 1].properties.uniquename) return !0;
 return !1
}

function topParentsDiffer(a, b, c) {
 for (; 0 < c--;)
  if (a[b][c].properties.uniquename != a[b - 1][c].properties.uniquename) return !0;
 return !1
}
SaikuTableRenderer.prototype.internalRender = function(a, b) {
 var c = "",
  d = "",
  e = a.cellset,
  f = e ? e : [],
  g, h, k, l, m, n = 0,
  s = [],
  q = null,
  t = !1,
  u = !1,
  z = !1,
  w = [],
  B = !0;
 b && (q = b.hasOwnProperty("batchSize") ? b.batchSize : null, B = b.hasOwnProperty("wrapContent") ? b.wrapContent : !0);
 var r = {};
 r[COLUMNS] = a.rowTotalsLists;
 r[ROWS] = a.colTotalsLists;
 for (var D = {}, y = {}, u = [ROWS, COLUMNS], d = 0; d < u.length; d++) D[u[d]] = [], y[u[d]] = [];
 if (r[COLUMNS])
  for (d = 0; d < r[COLUMNS].length; d++) y[COLUMNS][d] = 0, D[COLUMNS][d] = r[COLUMNS][d][y[COLUMNS][d]].width;
 for (var v =
   0, G = f.length; v < G; v++) {
  var H = v - a.topOffset;
  g = 1;
  var I = u = l = h = !1;
  if (r[ROWS])
   for (d = 0; d < r[ROWS].length; d++) y[ROWS][d] = 0, D[ROWS][d] = r[ROWS][d][y[ROWS][d]].width;
  d = "\x3ctr\x3e";
  0 === v && (d = "\x3cthead\x3e" + d);
  for (var x = 0, J = f[v].length; x < J; x++) {
   var F = x - a.leftOffset,
    p = e[v][x];
   "COLUMN_HEADER" === p.type && (u = !0);
   if ("COLUMN_HEADER" === p.type && "null" === p.value && (null == k || x < k)) d += '\x3cth class\x3d"all_null"\x3e\x26nbsp;\x3c/th\x3e';
   else if ("COLUMN_HEADER" === p.type) {
    null == k && (k = x);
    f[v].length == x + 1 ? l = !0 : m = e[v][x + 1];
    if (l) "null" ==
     p.value ? d += '\x3cth class\x3d"col_null"\x3e\x26nbsp;\x3c/th\x3e' : (r[ROWS] && (g = r[ROWS][v + 1][y[ROWS][v + 1]].span), d += '\x3cth class\x3d"col" style\x3d"text-align: center;" colspan\x3d"' + g + '" title\x3d"' + p.value + '"\x3e' + (B ? '\x3cdiv rel\x3d"' + v + ":" + x + '"\x3e' + p.value + "\x3c/div\x3e" : p.value) + "\x3c/th\x3e");
    else {
     var F = 1 < x && 1 < v && !h && x > k ? e[v - 1][x + 1].value != e[v - 1][x].value || e[v - 1][x + 1].properties.uniquename != e[v - 1][x].properties.uniquename : !1,
      C = 999 < g ? !0 : !1;
     p.value != m.value || nextParentsDiffer(e, v, x) || h || F || C ? ("null" ==
      p.value ? d += '\x3cth class\x3d"col_null" colspan\x3d"' + g + '"\x3e\x26nbsp;\x3c/th\x3e' : (r[ROWS] && (g = r[ROWS][v + 1][y[ROWS][v + 1]].span), d += '\x3cth class\x3d"col" style\x3d"text-align: center;" colspan\x3d"' + (0 == g ? 1 : g) + '" title\x3d"' + p.value + '"\x3e' + (B ? '\x3cdiv rel\x3d"' + v + ":" + x + '"\x3e' + p.value + "\x3c/div\x3e" : p.value) + "\x3c/th\x3e"), g = 1) : g++
    }
    r[ROWS] && (d += genTotalHeaderCells(x - a.leftOffset + 1, v + 1, D[ROWS], y[ROWS], r[ROWS], B))
   } else if ("ROW_HEADER" === p.type && "null" === p.value) d += '\x3cth class\x3d"row_null"\x3e\x26nbsp;\x3c/th\x3e';
   else if ("ROW_HEADER" === p.type) {
    n == x ? h = !0 : m = e[v][x + 1];
    F = e[v - 1];
    C = !I && !h && (0 == x || !topParentsDiffer(e, v, x)) && p.value === F[x].value;
    I = !C;
    F = C ? "\x3cdiv\x3e\x26nbsp;\x3c/div\x3e" : '\x3cdiv rel\x3d"' + v + ":" + x + '"\x3e' + p.value + "\x3c/div\x3e";
    B || (F = C ? "\x26nbsp;" : p.value);
    var C = C ? "row_null" : "row",
     E = 0;
    if (!h && ("undefined" == typeof m || "null" === m.value)) {
     var E = 1,
      A = p.properties.dimension,
      p = p.properties.level,
      p = A in s ? s[A].length - s[A].indexOf(p) : 1,
      A = x + 1;
     for (; E < p && A <= n + 1 && "null" !== e[v][A]; A++) E = A - x;
     x = x + E - 1
    }
    d += '\x3cth class\x3d"' +
     C + '" ' + (0 < E ? ' colspan\x3d"' + E + '"' : "") + "\x3e" + F + "\x3c/th\x3e"
   } else if ("ROW_HEADER_HEADER" === p.type) d += '\x3cth class\x3d"row_header"\x3e' + (B ? "\x3cdiv\x3e" + p.value + "\x3c/div\x3e" : p.value) + "\x3c/th\x3e", h = !0, n = x, p.properties.hasOwnProperty("dimension") && (A = p.properties.dimension, A in s || (s[A] = []), s[A].push(p.properties.level));
   else if ("DATA_CELL" === p.type) {
    t = !0;
    C = "";
    A = p.value;
    E = "";
    if (p.properties.hasOwnProperty("image")) var A = p.properties.hasOwnProperty("image_height") ? " height\x3d'" + p.properties.image_height +
     "'" : "",
     K = p.properties.hasOwnProperty("image_width") ? " width\x3d'" + p.properties.image_width + "'" : "",
     A = "\x3cimg " + A + " " + K + " style\x3d'padding-left: 5px' src\x3d'" + p.properties.image + "' border\x3d'0'\x3e";
    p.properties.hasOwnProperty("style") && (C = " style\x3d'background-color: " + p.properties.style + "' ");
    p.properties.hasOwnProperty("link") && (A = "\x3ca target\x3d'__blank' href\x3d'" + p.properties.link + "'\x3e" + A + "\x3c/a\x3e");
    p.properties.hasOwnProperty("arrow") && (E = "\x3cimg height\x3d'10' width\x3d'10' style\x3d'padding-left: 5px' src\x3d'./images/arrow-" +
     p.properties.arrow + ".gif' border\x3d'0'\x3e");
    d += '\x3ctd class\x3d"data" ' + C + "\x3e" + (B ? '\x3cdiv class\x3d"datadiv" alt\x3d"' + p.properties.raw + '" rel\x3d"' + p.properties.position + '"\x3e' : "") + A + E + (B ? "\x3c/div\x3e" : "") + "\x3c/td\x3e";
    r[ROWS] && (d += genTotalDataCells(F + 1, H, D[ROWS], y[ROWS], r, B))
   }
  }
  d += "\x3c/tr\x3e";
  g = "";
  r[COLUMNS] && 0 <= H && (g += genTotalHeaderRowCells(H + 1, D, y, r, B));
  t && q ? v <= q ? (u || z || (c += "\x3c/thead\x3e\x3ctbody\x3e", z = !0), c += d, 0 < g.length && (c += g)) : (w.push(d), 0 < g.length && w.push(g)) : (u || z || (c += "\x3c/thead\x3e\x3ctbody\x3e",
   z = !0), c += d, 0 < g.length && (c += g))
 }
 b && (b.batchResult = w, b.hasBatchResult = 0 < w.length);
 return "\x3ctable\x3e" + c + "\x3c/tbody\x3e\x3c/table\x3e"
};
var SaikuChartRenderer = function(a, b) {
 this.rawdata = a;
 this.cccOptions = {};
 this.data = null;
 this.hasRendered = this.hasProcessed = !1;
 if (!b && !b.hasOwnProperty("htmlObject")) throw "You need to supply a html object in the options for the SaikuChartRenderer!";
 this.el = $(b.htmlObject);
 this.id = _.uniqueId("chart_");
 $(this.el).html('\x3cdiv class\x3d"canvas_wrapper" style\x3d"display:none;"\x3e\x3cdiv id\x3d"canvas_' + this.id + '"\x3e\x3c/div\x3e\x3c/div\x3e');
 if (this.zoom = b.zoom) {
  var c = this;
  $("\x3cspan style\x3d'float:left;' class\x3d'zoombuttons'\x3e\x3ca href\x3d'#' class\x3d'button rerender i18n' title\x3d'Re-render chart'\x3e\x3c/a\x3e\x3ca href\x3d'#' class\x3d'button zoomout i18n' style\x3d'display:none;' title\x3d'Zoom back out'\x3e\x3c/a\x3e\x3c/span\x3e").prependTo($(this.el).find(".canvas_wrapper"));
  $(this.el).find(".zoomout").on("click", function(a) {
   a.preventDefault();
   c.zoomout()
  });
  $(this.el).find(".zoomin").on("click", function(a) {
   a.preventDefault();
   c.zoomin()
  });
  $(this.el).find(".rerender").on("click", function(a) {
   a.preventDefault();
   $(c.el).find(".zoomout").hide();
   c.switch_chart(c.type)
  })
 }
 b.chartDefinition && (this.chartDefinition = b.chartDefinition);
 this.cccOptions.canvas = "canvas_" + this.id;
 this.adjustSizeTo = this.data = null;
 this.adjustSizeTo = b.adjustSizeTo ? b.adjustSizeTo : b.htmlObject;
 this.rawdata &&
  ("sunburst" == this.type ? this.process_data_tree({
   data: this.rawdata
  }) : this.process_data_tree({
   data: this.rawdata
  }, !0, !0));
 b.mode ? this.switch_chart(b.mode) : this.switch_chart("stackedBar");
 this.adjust()
};
SaikuChartRenderer.prototype.adjust = function() {
 var a = this,
  b = _.debounce(function() {
   a.hasRendered && $(a.el).is(":visible") && a.switch_chart(a.type)
  }, 300);
 $(window).resize(function() {
  $(a.el).find(".canvas_wrapper").fadeOut(150);
  b()
 })
};
SaikuChartRenderer.prototype.zoomin = function() {
 $(this.el).find(".canvas_wrapper").hide();
 var a = this.chart.root,
  b = a.data;
 b.datums(null, {
  selected: !1
 }).each(function(a) {
  a.setVisible(!1)
 });
 b.clearSelected();
 a.render(!0, !0, !1);
 this.render_chart_element()
};
SaikuChartRenderer.prototype.zoomout = function() {
 var a = this.chart.root,
  b = a.data,
  c = a.keptVisibleDatumSet;
 null === c || 0 === c.length ? $(this.el).find(".zoomout").hide() : 1 == c.length ? ($(this.el).find(".zoomout").hide(), a.keptVisibleDatumSet = [], pvc.data.Data.setVisible(b.datums(null, {
  visible: !1
 }), !0)) : 1 < c.length && (a.keptVisibleDatumSet.splice(c.length - 1, 1), b = b.datums(null, {
  visible: !1
 }).array(), _.intersection(a.keptVisibleDatumSet[c.length - 1], b).forEach(function(a) {
  a.setVisible(!0)
 }));
 a.render(!0, !0, !1)
};
SaikuChartRenderer.prototype.render = function() {
 _.delay(this.render_chart_element, 0, this)
};
SaikuChartRenderer.prototype.switch_chart = function(a, b) {
 if (null != b || void 0 != b) {
  if (null != b.chartDefinition || void 0 != b.chartDefinition) this.chartDefinition = b.chartDefinition;
  if (null != b.workspace || void 0 != b.workspace) this.workspace = b.workspace
 }
 var c = {
  stackedBar: {
   type: "BarChart",
   stacked: !0
  },
  bar: {
   type: "BarChart"
  },
  multiplebar: {
   type: "BarChart",
   multiChartIndexes: [1],
   dataMeasuresInColumns: !0,
   orientation: "vertical",
   smallTitlePosition: "top",
   multiChartMax: 30,
   multiChartColumnsMax: Math.floor(this.cccOptions.width /
    200),
   smallWidth: 200,
   smallHeight: 150
  },
  line: {
   type: "LineChart"
  },
  pie: {
   type: "PieChart",
   multiChartIndexes: [0]
  },
  heatgrid: {
   type: "HeatGridChart"
  },
  stackedBar100: {
   type: "NormalizedBarChart"
  },
  area: {
   type: "StackedAreaChart"
  },
  dot: {
   type: "DotChart"
  },
  waterfall: {
   type: "WaterfallChart"
  },
  treemap: {
   type: "TreemapChart"
  },
  sunburst: {
   type: "SunburstChart"
  },
  multiplesunburst: {
   type: "SunburstChart",
   multiChartIndexes: [1],
   dataMeasuresInColumns: !0,
   orientation: "vertical",
   smallTitlePosition: "top",
   multiChartMax: 30,
   multiChartColumnsMax: Math.floor(this.cccOptions.width /
    200),
   smallWidth: 200,
   smallHeight: 150,
   seriesInRows: !1
  }
 };
 null !== a && "" !== a && ("sunburst" == a ? ($(this.el).find(".zoombuttons a").hide(), this.type = a, c = c[a], this.sunburst(c), this.hasProcessed && this.render()) : c.hasOwnProperty(a) ? ($(this.el).find(".zoombuttons a").hide(), this.type = a, c = c[a], this.cccOptions = this.getQuickOptions(c), this.define_chart(), this.hasProcessed && this.render()) : alert("Do not support chart type: '" + a + "'"))
};
SaikuChartRenderer.prototype.sunburst = function(a) {
 this.type = "sunburst";
 var b = this.process_data_tree({
  data: this.rawdata
 });
 a = this.getQuickOptions(a);
 var c = pv.dom(b).nodes();
 pv.colors(a.colors).by(function(a) {
  return a.parentNode && a.parentNode.nodeName
 });
 b = (new pv.Panel).width(a.width).height(a.height).canvas(a.canvas);
 c = b.add(pv.Layout.Partition.Fill).nodes(c).size(function(a) {
  return a.nodeValue
 }).order("descending").orient("radial");
 c.node.add(pv.Wedge).fillStyle(pv.colors(a.colors).by(function(a) {
  return a.parentNode &&
   a.parentNode.nodeName
 })).visible(function(a) {
  return 0 < a.depth
 }).strokeStyle("#000").lineWidth(.5).text(function(a) {
  var b = "";
  "undefined" != typeof a.nodeValue && (b = " : " + a.nodeValue);
  return a.nodeName + b
 }).cursor("pointer").events("all").event("mousemove", pv.Behavior.tipsy({
  delayIn: 200,
  delayOut: 80,
  offset: 2,
  html: !0,
  gravity: "nw",
  fade: !1,
  followMouse: !0,
  corners: !0,
  arrow: !1,
  opacity: 1
 }));
 c.label.add(pv.Label).visible(function(a) {
  return 6 <= a.angle * a.outerRadius
 });
 this.chart = b
};
SaikuChartRenderer.prototype.cccOptionsDefault = {
 Base: {
  animate: !1,
  selectable: !0,
  valuesVisible: !1,
  legend: !0,
  legendPosition: "top",
  legendAlign: "right",
  compatVersion: 2,
  legendSizeMax: "30%",
  axisSizeMax: "40%",
  plotFrameVisible: !1,
  orthoAxisMinorTicks: !1,
  colors: "#1f77b4 #aec7e8 #ff7f0e #ffbb78 #2ca02c #98df8a #d62728 #ff9896 #9467bd #c5b0d5 #8c564b #c49c94 #e377c2 #f7b6d2 #7f7f7f #c7c7c7 #bcbd22 #dbdb8d #17becf #9edae5".split(" ")
 },
 HeatGridChart: {
  orientation: "horizontal",
  useShapes: !0,
  shape: "circle",
  nullShape: "cross",
  colorNormByCategory: !1,
  sizeRole: "value",
  legendPosition: "right",
  legend: !0,
  hoverable: !0,
  axisComposite: !0,
  colors: ["red", "yellow", "lightgreen", "darkgreen"],
  yAxisSize: "20%"
 },
 WaterfallChart: {
  orientation: "horizontal"
 },
 PieChart: {
  multiChartColumnsMax: 3,
  multiChartMax: 30,
  smallTitleFont: "bold 14px sans-serif",
  valuesVisible: !0,
  valuesMask: "{category} / {value.percent}",
  explodedSliceRadius: "10%",
  extensionPoints: {
   slice_innerRadiusEx: "40%",
   slice_offsetRadius: function(a) {
    return a.isSelected() ? "10%" : 0
   }
  },
  clickable: !0
 },
 LineChart: {
  extensionPoints: {
   area_interpolate: "monotone",
   line_interpolate: "monotone"
  }
 },
 StackedAreaChart: {
  extensionPoints: {
   area_interpolate: "monotone",
   line_interpolate: "monotone"
  }
 },
 TreemapChart: {
  legendPosition: "right",
  multiChartIndexes: 0,
  extensionPoints: {
   leaf_lineWidth: 2
  },
  layoutMode: "slice-and-dice",
  valuesVisible: !0
 },
 SunburstChart: {
  valuesVisible: !1,
  hoverable: !1,
  selectable: !0,
  clickable: !1,
  multiChartIndexes: [0],
  multiChartMax: 30
 }
};
SaikuChartRenderer.prototype.getQuickOptions = function(a) {
 var b = a && a.type || "BarChart";
 a = _.extend({
  type: b,
  canvas: "canvas_" + this.id
 }, this.cccOptionsDefault.Base, this.cccOptionsDefault[b], a);
 if (this.adjustSizeTo) {
  var c = $(this.adjustSizeTo);
  c && 0 < c.length && (b = c.width() - 40, c = c.height() - 40, 0 < b && (a.width = b), 0 < c && (a.height = c))
 }
 null !== this.data && 5 < this.data.resultset.length && "HeatGridChart" !== a.type && "horizontal" !== a.orientation && (a.extensionPoints = _.extend(Object.create(a.extensionPoints || {}), {
  xAxisLabel_textAngle: -Math.PI /
   2,
  xAxisLabel_textAlign: "right",
  xAxisLabel_textBaseline: "middle"
 }));
 a.colors = ["#AE1717", "#AE5B17", "#0E6868"];
 return a
};
SaikuChartRenderer.prototype.define_chart = function(a) {
 this.hasProcessed || this.process_data_tree({
  data: this.rawdata
 }, !0, !0);
 var b = this,
  c = this.adjustSizeTo ? $(this.adjustSizeTo) : $(this.el),
  d = null !== this.data && 80 > this.data.height && 80 > this.data.width,
  e = null !== this.data && 300 > this.data.height && 300 > this.data.width,
  e = !d && !e,
  f = c.width() - 40,
  g = c.height() - 40,
  c = _.clone(this.cccOptions);
 a && a.width && (f = a.width);
 a && a.height && (g = a.height);
 0 < f && (c.width = f);
 0 < g && (c.height = g);
 e && (c.hasOwnProperty("extensionPoints") &&
  c.extensionPoints.hasOwnProperty("line_interpolate") && delete c.extensionPoints.line_interpolate, c.hasOwnProperty("extensionPoints") && c.extensionPoints.hasOwnProperty("area_interpolate") && delete c.extensionPoints.area_interpolate);
 a = {
  legend: {
   scenes: {
    item: {
     execute: function() {
      var a = this.chart();
      a.hasOwnProperty("keptVisibleDatumSet") || (a.keptVisibleDatumSet = []);
      a = 0 < a.keptVisibleDatumSet.length ? a.keptVisibleDatumSet[a.keptVisibleDatumSet.length - 1] : [];
      0 < a.length ? _.intersection(this.datums().array(), a).forEach(function(a) {
        a.toggleVisible()
       }) :
       pvc.data.Data.toggleVisible(this.datums());
      this.chart().render(!0, !0, !1)
     }
    }
   }
  },
  userSelectionAction: function(a) {
   if (0 === a.length) return [];
   var c = b.chart.root,
    d = c.data,
    e = this.chart;
   e.hasOwnProperty("keptVisibleDatumSet") || (e.keptVisibleDatumSet = []);
   if (1500 < d.datums().count()) pvc.data.Data.setSelected(a, !0);
   else if (d.datums(null, {
     visible: !0
    }).count() == d.datums().count()) {
    $(b.el).find(".zoomout, .rerender").show();
    var f = d.datums().array();
    _.each(_.difference(f, a), function(a) {
     a.setVisible(!1)
    });
    e.keptVisibleDatumSet = [];
    e.keptVisibleDatumSet.push(a)
   } else {
    f = 0 < e.keptVisibleDatumSet.length ? e.keptVisibleDatumSet[e.keptVisibleDatumSet.length - 1] : [];
    d = d.datums(null, {
     visible: !0
    }).array();
    d.length < f.length && e.keptVisibleDatumSet.push(d);
    var g = [];
    _.each(_.difference(d, a), function(a) {
     a.setVisible(!1)
    });
    _.each(_.intersection(d, a), function(a) {
     g.push(a)
    });
    0 < g.length && e.keptVisibleDatumSet.push(g)
   }
   c.render(!0, !0, !1);
   return []
  }
 };
 c = _.extend(c, {
  hoverable: d,
  animate: !1
 }, this.chartDefinition);
 b.zoom && (d = c.legend, c = _.extend(c, a), !1 ===
  d && (c.legend = !1));
 "TreemapChart" == c.type && (c.legend.scenes.item.labelText = function() {
  var a = "",
   b = this.group;
  if (b) switch (b = b.depth, b) {
   case 0:
    return "";
   case 1:
    break;
   case 2:
    a = " └ ";
    break;
   default:
    a = Array(2 * (b - 2) + 1).join(" ") + " └ "
  }
  return a + this.base()
 });
 this.chart = new pvc[c.type](c);
 this.chart.setData(this.data, {
  crosstabMode: !0,
  seriesInRows: !1
 })
};
SaikuChartRenderer.prototype.render_chart_element = function(a) {
 a = a || this;
 var b = null !== a.data && 300 > a.data.height && 300 > a.data.width,
  b = !(null !== a.data && 80 > a.data.height && 80 > a.data.width) && !b,
  c = !1;
 a.chart.options && a.chart.options.animate && (c = !0);
 if (!c || $(a.el).find(".canvas_wrapper").is(":visible")) $(a.el).find(".canvas_wrapper"), $(a.el).find(".canvas_wrapper").hide();
 try {
  c && $(a.el).find(".canvas_wrapper").show(), a.chart.render(), a.hasRendered = !0
 } catch (d) {
  $("#canvas_" + a.id).text("Could not render chart" +
   d)
 }
 if (a.chart.options && a.chart.options.animate) return !1;
 isIE || b ? $(a.el).find(".canvas_wrapper").show() : $(a.el).find(".canvas_wrapper").fadeIn(400);
 return !1
};
SaikuChartRenderer.prototype.process_data_tree = function(a, b, c) {
 var d = {};
 b && (d.resultset = [], d.metadata = [], d.height = 0, d.width = 0);
 var e = d;
 if ("undefined" != typeof a && "undefined" != typeof a.data && !(null !== a.data && null !== a.data.error || null === a.data || a.data.cellset && 0 === a.data.cellset.length)) {
  var f = a.data.cellset;
  if (f && 0 < f.length) {
   var g = 0,
    h = 0,
    k = !1,
    l, m, n, s = function(a, b) {
     return a + b
    };
   l = 0;
   for (m = f.length; 0 === h && l < m; l++)
    for (var q = 0, t = f[l].length; q < t; q++) {
     if (!k)
      for (;
       "COLUMN_HEADER" == f[l][q].type && "null" == f[l][q].value;) l++;
     k = !0;
     if ("ROW_HEADER_HEADER" == f[l][q].type) {
      for (;
       "ROW_HEADER_HEADER" == f[l][q].type;) b && d.metadata.push({
       colIndex: q,
       colType: "String",
       colName: f[l][q].value
      }), q++;
      g = q - 1
     }
     if ("COLUMN_HEADER" == f[l][q].type) {
      h = 0;
      for (n = []; h <= l;) "null" !== f[h][q].value && n.push(f[h][q].value), h++;
      b && d.metadata.push({
       colIndex: q,
       colType: "Numeric",
       colName: n.join(" ~ ")
      });
      h = l + 1
     }
    }
   k = [];
   for (n = 0; n <= g; n++) k.push(null);
   l = h;
   for (m = f.length; l < m; l++)
    if ("" !== f[l][0].value) {
     t = [];
     n = [];
     q = h = null;
     for (n = 0; n <= g; n++) {
      if (f[l] && "null" === f[l][n].value) {
       for (var e =
         d, u = 0; u < g && "null" === f[l][u].value; u++) e = e[k[u]];
       u > n && (n = u)
      }
      if (f[l] && "null" !== f[l][n].value) {
       if (0 === n)
        for (u = 0; u <= g; u++) k[u] = null;
       "number" == typeof e && (h[q] = {}, e = h[q]);
       q = f[l][n].value;
       k[n] = q;
       e.hasOwnProperty(q) || (e[q] = {});
       h = e;
       e = e[q]
      }
     }
     n = _.clone(k);
     e = g + 1;
     for (u = f[l].length; e < u; e++) {
      var z = f[l][e],
       w = z.value || 0,
       B = 0 !== w,
       r = z.properties.raw;
      r && "null" !== r ? w = parseFloat(r) : "number" !== typeof z.value && parseFloat(z.value.replace(/[^a-zA-Z 0-9.]+/g, "")) && (w = parseFloat(z.value.replace(/[^a-zA-Z 0-9.]+/g, "")), B = !1);
      0 <
       w && B && (w = z.value && 0 <= z.value.indexOf("%") ? 100 * w : w);
      t.push(w);
      n.push({
       f: z.value,
       v: w
      })
     }
     b && d.resultset.push(n);
     e = _.reduce(t, s, 0);
     q = null === q ? "null" : q;
     h[q] = e;
     e = d
    }
   c && (this.rawdata = a.data, this.data = d, this.hasProcessed = !0, this.data.height = this.data.resultset.length);
   return d
  }
  $(this.el).find(".canvas_wrapper").text("No results").show()
 }
};
var DataSources = Backbone.Model.extend({
  url: "admin/attacheddatasources",
  initialize: function(a, b) {
   b && b.dialog && (this.dialog = b.dialog)
  },
  parse: function(a) {
   this.dialog && this.dialog.callback(a)
  }
 }),
 Cube = Backbone.Model.extend({
  initialize: function(a) {
   this.url = Saiku.session.username + "/discover/" + a.key + "/metadata"
  },
  parse: function(a) {
   var b = _.template($("#template-dimensions").html(), {
     dimensions: a.dimensions
    }),
    c = _.template($("#template-measures").html(), {
     measures: a.measures
    }),
    d = _.template($("#template-attributes").html(), {
     cube: a
    });
   this.set({
    template_measures: c,
    template_dimensions: b,
    template_attributes: $(d).html(),
    data: a
   });
   "undefined" !== typeof localStorage && localStorage && localStorage.setItem("cube." + this.get("key"), JSON.stringify(this));
   return a
  }
 }),
 DimensionList = Backbone.View.extend({
  events: {
   "click span": "select",
   "click a": "select",
   "click .parent_dimension ul li a.level": "select_dimension",
   "click .measure": "select_measure",
   "click .addMeasure": "measure_dialog"
  },
  initialize: function(a) {
   _.bindAll(this, "render", "load_dimension",
    "select_dimension");
   this.workspace = a.workspace;
   this.cube = a.cube
  },
  load_dimension: function() {
   this.template = this.cube.get("template_attributes");
   this.render_attributes();
   this.workspace.sync_query()
  },
  render: function() {
   if (this.cube && this.cube.has("template_attributes")) this.load_dimension();
   else if (this.cube) {
    var a = _.template($("#template-attributes").html());
    $(this.el).html(a);
    $(this.el).find(".loading").removeClass("hide");
    this.workspace.bind("cube:loaded", this.load_dimension)
   } else $(this.el).html("Could not load attributes. Please log out and log in again.");
   return this
  },
  render_attributes: function() {
   $(this.el).html(this.template);
   isIE && 8 >= isIE ? $(this.el).show() : $(this.el).fadeTo(500, 1);
   $(this.el).find(".addMeasure, .calculated_measures").show();
   $(this.el).find(".measure").parent("li").draggable({
    cancel: ".not-draggable",
    connectToSortable: $(this.workspace.el).find(".fields_list_body.details ul.connectable"),
    helper: "clone",
    placeholder: "placeholder",
    opacity: .6,
    tolerance: "touch",
    containment: $(this.workspace.el),
    cursorAt: {
     top: 10,
     left: 35
    }
   });
   $(this.el).find(".level").parent("li").draggable({
    cancel: ".not-draggable, .hierarchy",
    connectToSortable: $(this.workspace.el).find(".fields_list_body.columns \x3e ul.connectable, .fields_list_body.rows \x3e ul.connectable, .fields_list_body.filter \x3e ul.connectable"),
    containment: $(this.workspace.el),
    helper: function(a, b) {
     var c = $(a.target).hasClass("d_level") ? $(a.target) : $(a.target).parent(),
      d = c.find("a").attr("hierarchy"),
      e = c.find("a").attr("level"),
      c = c.parent().clone().removeClass("d_hierarchy").addClass("hierarchy");
     c.find('li a[hierarchy\x3d"' + d + '"]').parent().hide();
     c.find('li a[level\x3d"' +
      e + '"]').parent().show();
     d = $('\x3cli class\x3d"selection"\x3e\x3c/li\x3e');
     d.append(c);
     return d
    },
    placeholder: "placeholder",
    opacity: .6,
    tolerance: "touch",
    cursorAt: {
     top: 10,
     left: 85
    }
   })
  },
  select: function(a) {
   a = $(a.target).hasClass("root") ? $(a.target) : $(a.target).parent().find("span");
   a.hasClass("root") && (a.find("a").toggleClass("folder_collapsed").toggleClass("folder_expand"), a.toggleClass("collapsed").toggleClass("expand"), a.parents("li").find("ul").children("li").toggle(), a.hasClass("expand") && Saiku.events.trigger("workspace:expandDimension",
    this, null));
   return !1
  },
  select_dimension: function(a, b) {
   if ("QUERYMODEL" == this.workspace.query.model.type)
    if ($(a.target).parent().hasClass("ui-state-disabled")) a.preventDefault(), a.stopPropagation();
    else {
     var c = $(a.target).attr("hierarchy");
     $(a.target).parent().parent().attr("hierarchycaption");
     var d = $(a.target).attr("level"),
      e = "ROWS",
      f = $(a.target).parent().hasClass("dimension-level-calcmember"),
      e = 0 < $(this.workspace.el).find(".workspace_fields ul.hierarchy[hierarchy\x3d'" + c + "']").length ? $(this.workspace.el).find(".workspace_fields ul[hierarchy\x3d'" +
       c + "'] a[level\x3d'" + d + "']").parent().show().parents(".fields_list_body").hasClass("rows") ? "ROWS" : "COLUMNS" : (0 < $(this.workspace.el).find(".workspace_fields .fields_list[title\x3d'ROWS'] ul.hierarchy").length ? $(this.workspace.el).find(".workspace_fields .fields_list[title\x3d'COLUMNS'] ul.connectable") : $(this.workspace.el).find(".workspace_fields .fields_list[title\x3d'ROWS'] ul.connectable")).parents(".fields_list").attr("title");
     f ? (f = $(a.target).attr("uniquename"), this.workspace.toolbar.$el.find(".group_parents").removeClass("on"),
      this.workspace.toolbar.group_parents(), this.workspace.query.helper.includeLevelCalculatedMember(e, c, d, f)) : this.workspace.query.helper.includeLevel(e, c, d);
     Saiku.session.trigger("dimensionList:select_dimension", {
      workspace: this.workspace
     });
     this.workspace.sync_query();
     this.workspace.query.run();
     a.preventDefault();
     return !1
    }
  },
  select_measure: function(a, b) {
   if (!$(a.target).parent().hasClass("ui-state-disabled")) {
    var c = $(a.target).parent().clone(),
     c = {
      name: c.find("a").attr("measure"),
      type: c.find("a").attr("type")
     };
    this.workspace.query.helper.includeMeasure(c);
    this.workspace.sync_query();
    this.workspace.query.run();
    a.preventDefault();
    return !1
   }
  },
  measure_dialog: function(a, b) {
   (new CalculatedMemberModal({
    workspace: this.workspace,
    measure: null
   })).render().open()
  }
 }),
 Toolbar = Backbone.View.extend({
  tagName: "div",
  events: {
   "click a": "call",
   "click #logo": "site"
  },
  template: function() {
   return _.template($("#template-toolbar").html())({
    data: this
   })
  },
  initialize: function() {
   _.extend(this, Backbone.Events);
   _.bindAll(this, "call");
   this.logo =
    Settings.LOGO ? "\x3ch1 id\x3d'logo_override'\x3e\x3cimg src\x3d'" + Settings.LOGO + "'/\x3e\x3c/h1\x3e" : "\x3ch1 id\x3d'logo'\x3e\x3ca href\x3d'http://www.meteorite.bi/' title\x3d'Saiku - Next Generation Open Source Analytics' target\x3d'_blank' class\x3d'sprite'\x3eSaiku\x3c/a\x3e\x3c/h1\x3e";
   this.render()
  },
  render: function() {
   $(this.el).attr("id", "toolbar").html(this.template());
   Saiku.events.trigger("toolbar:render", {
    toolbar: this
   });
   return this
  },
  call: function(a) {
   var b = $(a.target).attr("href").replace("#",
    "");
   if (this[b]) this[b](a);
   a.preventDefault()
  },
  new_query: function() {
   "undefined" != typeof ga && ga("send", "event", "MainToolbar", "New Query");
   var a = new Workspace;
   Saiku.tabs.add(a);
   Saiku.events.trigger("toolbar:new_query", this, a);
   return !1
  },
  open_query: function() {
   var a = _.find(Saiku.tabs._tabs, function(a) {
    return a.content instanceof OpenQuery
   });
   a ? a.select() : Saiku.tabs.add(new OpenQuery);
   return !1
  },
  logout: function() {
   Saiku.session.logout()
  },
  about: function() {
   (new AboutModal).render().open();
   return !1
  },
  issue_tracker: function() {
   window.open("http://jira.meteorite.bi/");
   return !1
  },
  help: function() {
   window.open("http://wiki.meteorite.bi/display/SAIK/Saiku+Documentation");
   return !1
  },
  site: function() {
   window.open("http://www.meteorite.bi/");
   return !1
  }
 }),
 Upgrade = Backbone.View.extend({
  events: {},
  initialize: function(a, b) {
   this.workspace = a.workspace;
   this.workspace.trigger("workspace:toolbar:render", {
    workspace: this.workspace
   })
  },
  daydiff: function(a, b) {
   return Math.round((b - a) / 864E5)
  },
  render: function() {
   new License;
   if (Settings.BIPLUGIN5) {
    void 0 != Saiku.session.get("notice") && null != Saiku.session.get("notice") &&
     "" != Saiku.session.get("notice") && $(this.el).append("\x3cdiv\x3e\x3cdiv id\x3d'uphead' class\x3d'upgradeheader'\x3eNotice:" + Saiku.session.get("notice") + "\x3c/div\x3e");
    if (void 0 != Settings.LICENSE.licenseType && "trial" != Settings.LICENSE.licenseType && "Open Source License" != Settings.LICENSE.licenseType) return this;
    if (void 0 != Settings.LICENSE && "trial" === Settings.LICENSE.licenseType) {
     var a = parseFloat(Settings.LICENSE.expiration),
      a = new Date(a);
     this.remainingdays = this.daydiff(new Date, a);
     $(this.el).append("\x3cdiv\x3e\x3cdiv id\x3d'uphead' class\x3d'upgradeheader'\x3eYou are using a Saiku Enterprise Trial license, you have " +
      this.remainingdays + " days remaining. \x3ca href\x3d'http://www.meteorite.bi/saiku-pricing'\x3eBuy licenses online.\x3c/a\x3e\x3c/div\x3e")
    } else $(this.el).append("")
   }
   return this
  },
  call: function(a) {}
 }),
 Modal = Backbone.View.extend({
  tagName: "div",
  className: "dialog",
  type: "modal",
  message: "Put content here",
  options: {
   autoOpen: !1,
   modal: !0,
   title: "Modal dialog",
   resizable: !1,
   draggable: !0
  },
  events: {
   "click a": "call"
  },
  buttons: [{
   text: "OK",
   method: "close"
  }],
  template: function() {
   return _.template("\x3cdiv class\x3d'dialog_icon'\x3e\x3c/div\x3e\x3cdiv class\x3d'dialog_body'\x3e\x3c%\x3d message %\x3e\x3c/div\x3e\x3cdiv class\x3d'dialog_footer'\x3e\x3c% _.each(buttons, function(button) { %\x3e\x3ca class\x3d'form_button btn btn-default i18n' href\x3d'#\x3c%\x3d button.method %\x3e'\x3e\x26nbsp;\x3c%\x3d button.text %\x3e\x26nbsp;\x3c/a\x3e\x3c% }); %\x3e\x3cdiv class\x3d'dialog_response'\x3e\x3c/div\x3e\x3c/div\x3e")(this)
  },
  initialize: function(a) {
   _.extend(this, a);
   _.bindAll(this, "call");
   _.extend(this, Backbone.Events)
  },
  render: function() {
   $(this.el).html(this.template()).addClass("dialog_" + this.type).dialog(this.options);
   var a = $(".ui-dialog-title");
   a.html(this.options.title);
   a.addClass("i18n");
   Saiku.i18n.translate();
   return this
  },
  call: function(a) {
   var b = a.target.hash.replace("#", "");
   if (!$(a.target).hasClass("disabled_toolbar") && this[b]) this[b](a);
   return !1
  },
  open: function() {
   $(this.el).dialog("open");
   this.trigger("open", {
    modal: this
   });
   return this
  },
  close: function() {
   $(this.el).dialog("destroy").remove();
   $(this.el).remove();
   return !1
  }
 });
$.ui.dialog.prototype._allowInteraction = function(a) {
 return !!$(a.target).closest(".ui-dialog, .ui-datepicker, .sp-input").length
};
var MDXModal = Modal.extend({
  type: "mdx",
  initialize: function(a) {
   this.options.title = "MDX";
   this.message = _.template("\x3ctextarea\x3e\x3c%\x3d mdx %\x3e\x3c/textarea\x3e")(a);
   this.bind("open", function() {
    $(this.el).parents(".ui-dialog").css({
     width: "550px"
    })
   })
  }
 }),
 SelectionsModal = Modal.extend({
  type: "selections",
  paramvalue: null,
  buttons: [{
   text: "OK",
   method: "save"
  }, {
   text: "Open Date Filter",
   method: "open_date_filter"
  }, {
   text: "Cancel",
   method: "close"
  }],
  events: {
   "click a": "call",
   "click .search_term": "search_members",
   "click .clear_search": "clear_search",
   "change #show_unique": "show_unique_action",
   "change #use_result": "use_result_action",
   "dblclick .selection_options li.option_value label": "click_move_selection",
   "click li.all_options": "click_all_member_selection",
   "change #show_totals": "show_totals_action"
  },
  show_unique_option: !1,
  use_result_option: Settings.MEMBERS_FROM_RESULT,
  show_totals_option: "",
  members_limit: Settings.MEMBERS_LIMIT,
  members_search_limit: Settings.MEMBERS_SEARCH_LIMIT,
  members_search_server: !1,
  selection_type: "INCLUSION",
  initialize: function(a) {
   _.extend(this, a);
   this.options.title = "\x3cspan class\x3d'i18n'\x3eSelections for\x3c/span\x3e " + this.name;
   this.message = "Fetching members...";
   this.query = a.workspace.query;
   this.selected_members = [];
   this.available_members = [];
   this.topLevel;
   _.bindAll(this, "fetch_members", "populate", "finished", "get_members", "use_result_action", "show_totals_action");
   this.axis = "undefined";
   a.axis ? (this.axis = a.axis, "FILTER" == a.axis && (this.use_result_option = !1)) : (a.target.parents(".fields_list_body").hasClass("rows") &&
    (this.axis = "ROWS"), a.target.parents(".fields_list_body").hasClass("columns") && (this.axis = "COLUMNS"), a.target.parents(".fields_list_body").hasClass("filter") && (this.axis = "FILTER", this.use_result_option = !1));
   this.bind("open", this.post_render);
   this.render();
   $(this.el).parent().find(".ui-dialog-titlebar-close").bind("click", this.finished);
   this.member = new Member({}, {
    cube: a.workspace.selected_cube,
    dimension: a.key
   });
   $(this.el).find(".dialog_body").html(_.template($("#template-selections").html())(this));
   var b = this.member.level;
   a = this.workspace.query.helper.getHierarchy(this.member.hierarchy);
   var c = null;
   a && a.levels.hasOwnProperty(b) && (c = a.levels[b]);
   "DateFilterModal" === this.source && _.has(c, "selection") && 0 === c.selection.members.length || "DateFilterModal" === this.source && 1 === _.size(c) && _.has(c, "name") ? this.$el.find(".dialog_footer a:nth-child(2)").show() : this.$el.find(".dialog_footer a:nth-child(2)").hide();
   Settings.ALLOW_PARAMETERS && (c && (b = c.selection ? c.selection.parameterName : null) && ($(this.el).find("#parameter").val(b),
    void 0 != this.query.helper.model().parameters[b] && (this.paramvalue = this.query.helper.model().parameters[b].split(","))), $(this.el).find(".parameter").removeClass("hide"));
   b = $(this.el).find("#show_totals");
   b.val("");
   1 < _.size(a.levels) && c && c.hasOwnProperty("aggregators") && c.aggregators ? (0 < c.aggregators.length && (this.show_totals_option = c.aggregators[0]), b.removeAttr("disabled")) : (b.attr("disabled", !0), this.show_totals_option = "");
   b.val(this.show_totals_option);
   b.removeAttr("disabled");
   $(this.el).find("#use_result").attr("checked",
    this.use_result_option);
   $(this.el).find(".search_limit").text(this.members_search_limit);
   $(this.el).find(".members_limit").text(this.members_limit);
   0 < this.workspace.query.helper.getCalculatedMembers().length ? this.fetch_calcmembers_levels() : this.get_members()
  },
  open_date_filter: function(a) {
   a.preventDefault();
   (new DateFilterModal({
    dimension: this.objDateFilter.dimension,
    hierarchy: this.objDateFilter.hierarchy,
    target: this.target,
    name: this.name,
    data: this.objDateFilter.data,
    analyzerDateFormat: this.objDateFilter.analyzerDateFormat,
    dimHier: this.objDateFilter.dimHier,
    key: this.key,
    workspace: this.workspace
   })).open();
   this.$el.dialog("destroy").remove()
  },
  show_totals_action: function(a) {
   this.show_totals_option = $(a.target).val()
  },
  get_members: function() {
   var a = this,
    b = "/result/metadata/hierarchies/" + encodeURIComponent(this.member.hierarchy) + "/levels/" + encodeURIComponent(this.member.level);
   this.search_path = b;
   a.workspace.block('\x3cspan class\x3d"processing_image"\x3e\x26nbsp;\x26nbsp;\x3c/span\x3e \x3cspan class\x3d"i18n"\x3e' + a.message +
    "\x3c/span\x3e ");
   this.workspace.query.action.gett(b, {
    success: this.fetch_members,
    error: function() {
     a.workspace.unblock()
    },
    data: {
     result: this.use_result_option,
     searchlimit: this.members_limit
    }
   })
  },
  clear_search: function() {
   $(this.el).find(".filterbox").val("");
   this.get_members()
  },
  search_members: function() {
   var a = this,
    b = $(this.el).find(".filterbox").val();
   if (!b) return !1;
   a.workspace.block('\x3cspan class\x3d"processing_image"\x3e\x26nbsp;\x26nbsp;\x3c/span\x3e \x3cspan class\x3d"i18n"\x3eSearching for members matching:\x3c/span\x3e ' +
    b);
   a.workspace.query.action.gett(a.search_path, {
    async: !1,
    success: function(b, d) {
     d && 0 < d.length && (a.available_members = d);
     a.populate()
    },
    error: function() {
     a.workspace.unblock()
    },
    data: {
     search: b,
     searchlimit: a.members_search_limit
    }
   })
  },
  fetch_calcmembers_levels: function() {
   var a = this.member.hierarchy.split("].["),
    b = !0;
   1 === a.length && (b = !1, a = this.member.hierarchy.split("."));
   if (1 < a.length) var c = a[1].replace(/[\[\]]/gi, "");
   a = a[0].replace(/[\[\]]/gi, "");
   this.workspace.block('\x3cspan class\x3d"processing_image"\x3e\x26nbsp;\x26nbsp;\x3c/span\x3e \x3cspan class\x3d"i18n"\x3e' +
    this.message + "\x3c/span\x3e ");
   b || (c = void 0 != c ? a + "." + c : a);
   (new Level({}, {
    ui: this,
    cube: this.workspace.selected_cube,
    dimension: a,
    hierarchy: c
   })).fetch({
    success: this.get_levels
   })
  },
  get_levels: function(a, b) {
   b && 0 < b.length && (a.ui.topLevel = b[0], a.ui.get_members())
  },
  get_calcmembers: function() {
   var a = this,
    b = this.member.hierarchy,
    c = this.workspace.query.helper.getCalculatedMembers(),
    d = [];
   this.topLevel.name === this.member.level ? _.filter(c, function(a) {
    a.hierarchyName === b && _.isEmpty(a.parentMember) && (a.uniqueName =
     a.hierarchyName + ".[" + a.name + "]", d.push(a))
   }) : _.filter(c, function(c) {
    c.hierarchyName === b && c.parentMemberLevel === a.member.level && (c.uniqueName = c.parentMember + ".[" + c.name + "]", d.push(c))
   });
   return d
  },
  fetch_members: function(a, b) {
   var c = this;
   b && 0 < b.length && _.each(b, function(a) {
    var b = c.workspace.query.helper.getCalculatedMembers(),
     f = !1;
    b && 0 < b.length && _.each(b, function(b) {
     b.uniqueName === a.uniqueName && (f = !0)
    });
    c.available_members.push({
     obj: a,
     calc: f
    })
   });
   this.populate()
  },
  populate: function(a, b) {
   var c = this;
   c.workspace.unblock();
   this.members_search_server = this.available_members.length >= this.members_limit || 0 == this.available_members.length;
   c.show_unique_option = !1;
   $(this.el).find(".options #show_unique").attr("checked", !1);
   if (0 < this.workspace.query.helper.getCalculatedMembers().length)
    for (var d = this.get_calcmembers(), e = d.length, f = 0; f < e; f++) {
     var g = c.workspace.query.helper.getCalculatedMembers(),
      h = !1;
     g && 0 < g.length && _.each(g, function(a) {
      a.uniqueName === d[f].uniqueName && (h = !0)
     });
     this.available_members.push({
      obj: d[f],
      calc: h
     })
    }
   $(this.el).find(".items_size").text(this.available_members.length);
   this.members_search_server ? $(this.el).find(".warning").text("More items available than listed. Pre-Filter on server.") : $(this.el).find(".warning").text("");
   e = c.member.level;
   (g = c.workspace.query.helper.getHierarchy(c.member.hierarchy)) && g.levels.hasOwnProperty(e) && (this.selected_members = [], g.levels[e].selection && _.each(g.levels[e].selection.members, function(a) {
    var b = c.workspace.query.helper.getCalculatedMembers(),
     d = !1;
    b && 0 < b.length && _.each(b, function(b) {
     b.uniqueName === a.uniqueName && (d = !0)
    });
    c.selected_members.push({
     obj: a,
     calc: d
    })
   }), this.selection_type = g.levels[e].selection ? g.levels[e].selection.type : "INCLUSION");
   for (var k = [], g = 0, e = this.selected_members.length; g < e; g++) k.push(this.selected_members[g].obj.caption);
   0 == $(this.el).find(".used_selections .selection_options li.option_value").length && (g = $(this.el).find(".used_selections .selection_options"), g.empty(), e = _.template($("#template-selections-options").html())({
    options: this.selected_members
   }), $(g).html(e));
   this.available_members = _.select(this.available_members,
    function(a) {
     return -1 === k.indexOf(a.obj.caption)
    });
   0 < this.available_members.length && (g = $(this.el).find(".available_selections .selection_options"), g.empty(), e = _.template($("#template-selections-options").html())({
    options: this.available_members
   }), $(g).html(e));
   0 < $(c.el).find(".selection_options.ui-selectable").length && $(c.el).find(".selection_options").selectable("destroy");
   $(c.el).find(".selection_options").selectable({
    distance: 20,
    filter: "li",
    stop: function(a, b) {
     $(c.el).find(".selection_options li.ui-selected input").each(function(a,
      b) {
      b && b.hasAttribute("checked") ? b.checked = !0 : $(b).attr("checked", !0);
      $(b).parents(".selection_options").find("li.all_options input").prop("checked", !0)
     });
     $(c.el).find(".selection_options li.ui-selected").removeClass("ui-selected")
    }
   });
   $(this.el).find(".filterbox").autocomplete({
    minLength: 1,
    delay: 200,
    appendTo: ".autocomplete",
    source: function(a, b) {
     var d = 0 == c.show_unique_option ? "caption" : "name",
      e = $.map(c.available_members, function(b) {
       if (-1 < b[d].toLowerCase().indexOf(a.term.toLowerCase())) return {
        label: 0 ==
         c.show_unique_option ? b.caption : b.uniqueName,
        value: 0 == c.show_unique_option ? b.uniqueName : b.caption
       }
      });
     b(e)
    },
    select: function(a, b) {
     encodeURIComponent(b.item.value);
     var d = b.item.label,
      e = 0 == c.show_unique_option ? b.item.value : b.item.label,
      f = 0 == c.show_unique_option ? b.item.label : b.item.value;
     $(c.el).find('.available_selections .selection_options input[value\x3d"' + encodeURIComponent(e) + '"]').parent().remove();
     $(c.el).find('.used_selections .selection_options input[value\x3d"' + encodeURIComponent(e) + '"]').parent().remove();
     d = '\x3cli class\x3d"option_value"\x3e\x3cinput type\x3d"checkbox" class\x3d"check_option" value\x3d"' + encodeURIComponent(e) + '" label\x3d"' + encodeURIComponent(f) + '"\x3e' + d + "\x3c/input\x3e\x3c/li\x3e";
     $(d).appendTo($(c.el).find(".used_selections .selection_options ul"));
     $(c.el).find(".filterbox").val("");
     b.item.value = ""
    },
    close: function(a, b) {},
    open: function(a, b) {}
   });
   $(this.el).find(".filterbox").autocomplete("enable");
   "EXCLUSION" === this.selection_type ? ($(this.el).find(".selection_type_inclusion").prop("checked", !1), $(this.el).find(".selection_type_exclusion").prop("checked", !0)) : ($(this.el).find(".selection_type_inclusion").prop("checked", !0), $(this.el).find(".selection_type_exclusion").prop("checked", !1));
   Saiku.i18n.translate();
   Saiku.ui.unblock()
  },
  post_render: function(a) {
   var b = ($(window).width() - 1E3) / 2,
    c = 1040 > $(window).width() ? $(window).width() : 1040;
   $(a.modal.el).parents(".ui-dialog").css({
    width: c,
    left: "inherit",
    margin: "0",
    height: 585
   }).offset({
    left: b
   });
   $("#filter_selections").attr("disabled", !1);
   $(this.el).find("a[href\x3d#save]").focus();
   $(this.el).find("a[href\x3d#save]").blur()
  },
  move_selection: function(a) {
   a.preventDefault();
   a = $(a.target).attr("id");
   var b = -1 !== a.indexOf("add") ? $(this.el).find(".used_selections .selection_options ul") : $(this.el).find(".available_selections .selection_options ul"),
    c = -1 !== a.indexOf("add") ? $(this.el).find(".available_selections .selection_options ul") : $(this.el).find(".used_selections .selection_options ul");
   (-1 !== a.indexOf("all") ? c.find("li.option_value input").parent() : c.find("li.option_value input:checked").parent()).detach().appendTo(b);
   $(this.el).find(".selection_options ul li.option_value input:checked").prop("checked", !1);
   $(this.el).find(".selection_options li.all_options input").prop("checked", !1)
  },
  updown_selection: function(a) {
   a.preventDefault();
   return !1
  },
  click_all_member_selection: function(a, b) {
   $(a.currentTarget).find("input").is(":checked") ? $(a.currentTarget).parent().find("li.option_value input").prop("checked", !0) : $(a.currentTarget).parent().find("li.option_value input").removeAttr("checked")
  },
  click_move_selection: function(a,
   b) {
   a.preventDefault();
   var c = $(a.target).parent().parent().parent().parent().hasClass("used_selections") ? ".available_selections" : ".used_selections";
   $(a.target).parent().appendTo($(this.el).find(c + " .selection_options ul"))
  },
  show_unique_action: function() {
   this.show_unique_option = !this.show_unique_option;
   !0 === this.show_unique_option ? ($(this.el).find(".available_selections, .used_selections").addClass("unique"), $(this.el).find(".available_selections, .used_selections").removeClass("caption")) : ($(this.el).find(".available_selections, .used_selections").addClass("caption"),
    $(this.el).find(".available_selections, .used_selections").removeClass("unique"))
  },
  use_result_action: function() {
   this.use_result_option = !this.use_result_option;
   this.get_members()
  },
  save: function() {
   var a = this,
    b = $("\x3cdiv\x3eSaving...\x3c/div\x3e");
   $(this.el).find(".dialog_body").children().hide();
   $(this.el).find(".dialog_body").prepend(b);
   var c = decodeURIComponent(a.member.hierarchy),
    d = decodeURIComponent(a.member.level),
    b = a.workspace.query.helper.getHierarchy(c),
    e = [],
    f = this.show_totals_option;
   0 !== $(this.el).find(".used_selections input").length &&
    (a.workspace.query.helper.removeAllLevelCalculatedMember(c), $(this.el).find(".used_selections .option_value input").each(function(b, f) {
     var g = $(f).val();
     if ($(f).hasClass("cmember")) {
      var m = $(f).attr("label");
      a.workspace.toolbar.group_parents();
      a.workspace.query.helper.includeLevelCalculatedMember(a.axis, c, d, decodeURIComponent(g), 0);
      e.push({
       uniqueName: decodeURIComponent(g),
       caption: decodeURIComponent(m),
       type: "calculatedmember"
      })
     } else m = $(f).attr("label"), e.push({
      uniqueName: decodeURIComponent(g),
      caption: decodeURIComponent(m)
     })
    }));
   var g = $("#parameter").val();
   b && b.levels.hasOwnProperty(d) && (b.levels[d].aggregators = [], f && b.levels[d].aggregators.push(f), f = $(a.el).find("input.selection_type:checked").val(), b.levels[d].selection = {
    type: f ? f : "INCLUSION",
    members: e
   }, Settings.ALLOW_PARAMETERS && g && (b.levels[d].selection.parameterName = g, a.workspace.query.helper.model()));
   this.finished()
  },
  finished: function() {
   $("#filter_selections").remove();
   this.available_members = null;
   $(this.el).find(".filterbox").autocomplete("destroy").remove();
   $(this.el).dialog("destroy");
   $(this.el).remove();
   this.query.run()
  }
 }),
 DrillthroughModal = Modal.extend({
  type: "drillthrough",
  buttons: [{
   text: "Ok",
   method: "ok"
  }, {
   text: "Cancel",
   method: "close"
  }],
  events: {
   "click .collapsed": "select",
   "click .expand": "select",
   "click .folder_collapsed": "select",
   "click .folder_expanded": "select",
   "click .dialog_footer a": "call",
   "click .parent_dimension input": "select_dimension",
   "click .measure_tree input": "select_measure",
   "click input.all_measures": "select_all_measures",
   "click input.all_dimensions": "select_all_dimensions"
  },
  allMeasures: !1,
  templateContent: function() {
   return $("#template-drillthrough").html()
  },
  initialize: function(a) {
   _.extend(this, a);
   this.options.title = a.title;
   this.query = a.workspace.query;
   this.position = a.position;
   this.action = a.action;
   Saiku.ui.unblock();
   _.bindAll(this, "ok", "drilled", "template");
   this.render();
   $(this.el).find(".dialog_body").html(_.template(this.templateContent())(this));
   $(this.el).find(".maxrows").val(this.maxrows);
   this.query.get("schema");
   a = $("#template-drillthrough-list").html();
   var b = Saiku.session.sessionworkspace.cube[e],
    c = null,
    d = null,
    e = this.workspace.selected_cube;
   b && b.has("data") && (c = b.get("data").dimensions, d = b.get("data").measures);
   b && c && d || ("undefined" !== typeof localStorage && localStorage && null !== localStorage.getItem("cube." + e) ? Saiku.session.sessionworkspace.cube[e] = new Cube(JSON.parse(localStorage.getItem("cube." + e))) : (Saiku.session.sessionworkspace.cube[e] = new Cube({
    key: e
   }), Saiku.session.sessionworkspace.cube[e].fetch({
    async: !1
   })), c = Saiku.session.sessionworkspace.cube[e].get("data").dimensions, d = Saiku.session.sessionworkspace.cube[e].get("data").measures);
   e = _.template($("#template-drillthrough-dimensions").html())({
    dimensions: c
   });
   d = _.template($("#template-drillthrough-measures").html())({
    measures: d,
    allMeasures: this.allMeasures
   });
   $(a).appendTo($(this.el).find(".dialog_body"));
   $(this.el).find(".sidebar").height($("body").height() / 2 + $("body").height() / 6);
   $(this.el).find(".sidebar").width(380);
   $(this.el).find(".dimension_tree").html("").append($(e));
   $(this.el).find(".measure_tree").html("").append($(d));
   Saiku.i18n.translate()
  },
  select: function(a) {
   a = $(a.target).hasClass("root") ?
    $(a.target) : $(a.target).parent().find("span");
   a.hasClass("root") && (a.find("a").toggleClass("folder_collapsed").toggleClass("folder_expand"), a.toggleClass("collapsed").toggleClass("expand"), a.parents("li").find("ul").children("li").toggle());
   return !1
  },
  select_dimension: function(a) {
   a = $(a.target);
   var b = a.is(":checked");
   a.parent().find("input").attr("checked", b)
  },
  select_all_dimensions: function(a) {
   a = $(a.target).is(":checked");
   $(this.el).find(".dimension_tree input").attr("checked", a)
  },
  select_all_measures: function(a) {
   a =
    $(a.target).is(":checked");
   $(this.el).find(".measure_tree input").attr("checked", a)
  },
  select_measure: function(a) {
   $(a.target).is(":checked")
  },
  ok: function() {
   "undefined" != typeof ga && ga("send", "event", "Drillthrough", "Execute");
   var a = $("\x3cdiv\x3eDrilling through...\x3c/div\x3e");
   $(this.el).find(".dialog_body").children().hide();
   $(this.el).find(".dialog_body").prepend(a);
   var b = "";
   $(this.el).find(".check_level:checked").each(function(a) {
    0 < a && (b += ", ");
    b += $(this).val()
   });
   var a = $(this.el).find(".maxrows").val(),
    c;
   c = "?maxrows\x3d" + a + ("undefined" !== typeof this.position ? "\x26position\x3d" + this.position : "");
   c += "\x26returns\x3d" + b;
   "export" == this.action ? (a = Settings.REST_URL + "api/query/" + this.query.id + "/drillthrough/export/csv" + c, this.close(), window.open(a)) : "table" == this.action && (Saiku.ui.block("Executing drillthrough..."), this.query.action.gett("/drillthrough", {
    data: {
     position: this.position,
     maxrows: a,
     returns: b
    },
    success: this.drilled
   }), this.close());
   return !1
  },
  drilled: function(a, b) {
   var c = "",
    c = null != b && null != b.error ?
    safe_tags_replace(b.error) : (new SaikuTableRenderer).render(b);
   Saiku.ui.unblock();
   c = '\x3cdiv id\x3d"fancy_results" class\x3d"workspace_results" style\x3d"overflow:visible"\x3e' + c + "\x3c/div\x3e";
   this.remove();
   $.fancybox(c, {
    autoDimensions: !1,
    autoScale: !1,
    height: $("body").height() - 100,
    width: $("body").width() - 100,
    transitionIn: "none",
    transitionOut: "none"
   })
  },
  finished: function() {
   $(this.el).dialog("destroy").remove();
   this.query.run()
  }
 }),
 DrillAcrossModal = DrillthroughModal.extend({
  allMeasures: !0,
  templateContent: function() {
   return $("#template-drillacross").html()
  },
  ok: function() {
   "undefined" != typeof ga && ga("send", "event", "DrillAcross", "Execute");
   var a = this,
    b = {};
   $(this.el).find(".check_level:checked").each(function(a) {
    a = $(this).attr("key");
    b[a] || (b[a] = []);
    b[a].push($(this).val())
   });
   Saiku.ui.block("Executing drillacross...");
   this.query.action.post("/drillacross", {
    data: {
     position: this.position,
     drill: JSON.stringify(b)
    },
    success: function(b, d) {
     a.workspace.query.parse(d);
     a.workspace.unblock();
     a.workspace.sync_query();
     a.workspace.query.run()
    },
    error: function(b, d, e) {
     a.workspace.unblock();
     b = "";
     d && d.hasOwnProperty("responseText") && (b = d.responseText);
     alert("Error drilling across. Check logs! " + b)
    }
   });
   this.close();
   return !1
  }
 }),
 PermissionsModal = Modal.extend({
  type: "permissions",
  buttons: [{
   text: "Ok",
   method: "ok"
  }, {
   text: "Cancel",
   method: "close"
  }],
  events: {
   "click .add_role": "add_role",
   "click .remove_acl": "remove_acl",
   "submit form": "add_role",
   "click a": "call",
   "click input.private": "keep_private"
  },
  rolesacl: {},
  acltype: "SECURED",
  initialize: function(a) {
   _.extend(this, a);
   this.options.title = a.title;
   this.file =
    a.file;
   this.rolesacl = {};
   Saiku.ui.unblock();
   _.bindAll(this, "ok", "add_role", "remove_acl");
   this.bind("open", Saiku.i18n.translate());
   this.render();
   $(this.el).find(".dialog_body").html(_.template($("#template-permissions").html())(this));
   $(this.el).find(".filterbox").autocomplete({
    minLength: 1,
    source: Saiku.session.roles
   }).data("autocomplete");
   a = new RepositoryAclObject({
    file: this.file
   });
   a.fetch({
    async: !1
   });
   var b = "undefined" == typeof a.get("roles") || null === a.get("roles") ? {} : a.get("roles");
   this.rolesacl = b;
   b = _.template($("#template-permissions-rolelist").html())({
    roles: b
   });
   $(this.el).find(".rolelist").html(b);
   b = "undefined" == typeof a.get("owner") || null === a.get("owner") ? "" : a.get("owner");
   a = "undefined" == typeof a.get("type") || null === a.get("type") ? null : a.get("type");
   null !== a && "PRIVATE" == a && ($(this.el).find(".private_owner .owner").text(b), $(this.el).find(".private_owner").show());
   $(this.el).find(".i18n").i18n(Saiku.i18n.po_file)
  },
  add_role: function(a) {
   a.preventDefault();
   if ("PRIVATE" == this.acltype) return !1;
   a = $(this.el).find(".filterbox").val();
   var b = [],
    c = "",
    d = 0;
   a && 0 < a.length && ($(this.el).find(".acl:checked").each(function(a) {
    0 < a && (c += ", ");
    d++;
    c += $(this).val();
    b.push($(this).val())
   }), 0 < d ? (this.rolesacl[a] = b, $("\x3coption value\x3d'" + a + "'\x3e" + a + " [" + c + "]\x3c/option\x3e").appendTo($(this.el).find(".select_roles")), a = $(this.el).find(".filterbox").val("")) : alert("You need to chose at least one ACL method for this role."));
   return !1
  },
  keep_private: function(a) {
   $(this.el).find("input.private").is(":checked") ?
    ($(this.el).find(".permissions").addClass("disabled_toolbar"), $("input.acl, input.filterbox, input.add_role, input.remove_acl").prop("disabled", !0), this.acltype = "PRIVATE") : ($(this.el).find(".permissions").removeClass("disabled_toolbar"), $("input.acl, input.filterbox, input.add_role, input.remove_acl").prop("disabled", !1), this.acltype = "SECURED")
  },
  remove_acl: function(a) {
   var b = this;
   if ("PRIVATE" == this.acltype) return !1;
   $(this.el).find(".select_roles option:selected").each(function(a) {
    delete b.rolesacl[$(this).val()]
   });
   $(this.el).find(".select_roles option:selected").remove();
   return !1
  },
  ok: function() {
   var a = this.close(),
    b = {},
    b = "PRIVATE" == this.acltype ? {
     type: "PRIVATE",
     owner: Saiku.session.username
    } : {
     type: "SECURED",
     roles: this.rolesacl,
     owner: Saiku.session.username
    };
   (new RepositoryAclObject({
    file: this.file,
    acl: JSON.stringify(b)
   })).save({
    success: a
   });
   return !1
  }
 }),
 DemoLoginForm = Modal.extend({
  type: "login",
  message: "\x3cform id\x3d'demo_form'\x3e\x3clabel for\x3d'email'\x3eEmail:\x3c/label\x3e\x3cinput type\x3d'text' id\x3d'email' name\x3d'email' value\x3d'' /\x3e\x3c/form\x3e",
  buttons: [{
   text: "Start Demo",
   method: "login"
  }],
  events: {
   "click a": "call",
   "submit form ": "login"
  },
  initialize: function(a) {
   _.extend(this, a);
   _.bindAll(this, "adjust");
   this.options.title = Settings.VERSION;
   this.bind("open", this.adjust);
   this.session.login(Settings.USERNAME, Settings.PASSWORD);
   $(this.el).dialog("close")
  },
  adjust: function() {
   $(this.el).parent().find(".ui-dialog-titlebar-close").hide();
   $(this.el).find("#email").select().focus()
  },
  login: function(a) {
   var b = Settings.USERNAME,
    c = Settings.PASSWORD,
    d = $(this.el).find("#email").val();
   d && ((new logger({
    url: Settings.TELEMETRY_SERVER + "/input/demo"
   })).log({
    email: d,
    created_at: Math.round((new Date).getTime() / 1E3)
   }), $(this.el).dialog("close"), this.session.login(b, c));
   a && (a.preventDefault(), a.stopPropagation());
   return !0
  }
 }),
 LoginForm = Modal.extend({
  type: "login",
  message: _.template('\x3cform id\x3d"login_form"\x3e\x3clabel for\x3d"username" class\x3d"i18n"\x3eUsername\x3c/label\x3e\x3cinput type\x3d"text" id\x3d"username" name\x3d"username"\x3e\x3clabel for\x3d"password" class\x3d"i18n"\x3ePassword\x3c/label\x3e\x3cinput type\x3d"password" id\x3d"password" name\x3d"password"\x3e\x3c% if (Settings.EVALUATION_PANEL_LOGIN) { %\x3e\x3cdiv class\x3d"eval-panel"\x3e\x3ca href\x3d"#eval_login" class\x3d"i18n" id\x3d"eval-login"\x3eEvaluation Login\x3c/a\x3e\x3cdiv class\x3d"eval-panel-user clearfix" hidden\x3e\x3cul\x3e\x3cli class\x3d"i18n"\x3eAdministrator\x3c/li\x3e\x3cli class\x3d"i18n"\x3eUsername: admin\x3c/li\x3e\x3cli class\x3d"i18n"\x3ePassword: admin\x3c/li\x3e\x3c/ul\x3e\x3c/div\x3e\x3c/div\x3e\x3c% } %\x3e\x3c/form\x3e')(),
  options: {
   autoOpen: !1,
   closeOnEscape: !1,
   modal: !0,
   title: Settings.VERSION,
   resizable: !1,
   draggable: !1
  },
  buttons: [{
   text: "Login",
   method: "login"
  }, {
   text: "Upload License",
   method: "upload_license"
  }],
  events: {
   "click .dialog_footer a": "call",
   "keyup #login_form input": "check",
   "click #eval-login": "show_panel_user",
   "click .clearlink": "clear_login"
  },
  initialize: function(a) {
   _.extend(this, a);
   _.bindAll(this, "adjust");
   this.bind("open", this.adjust)
  },
  adjust: function() {
   this.$el.parent().find(".ui-dialog-titlebar-close").hide();
   this.$el.find("#username").focus();
   this.$el.find(".dialog_footer").find('a[href\x3d"#upload_license"]').hide()
  },
  check: function(a) {
   13 === a.which && this.login()
  },
  login: function() {
   var a = this.$el.find("#username").val(),
    b = this.$el.find("#password").val();
   this.$el.dialog("close");
   this.session.login(a, b, this.$el);
   return !0
  },
  clear_login: function(a) {
   window.open("/clear.html", "_blank")
  },
  setMessage: function(a) {
   this.$el.find(".dialog_body").html(this.message)
  },
  setError: function(a) {
   this.$el.find(".dialog_response").html(a);
   "license expired" === a && this.$el.find(".dialog_footer").find('a[href\x3d"#upload_license"]').show();
   this.$el.find(".clearlink").unbind()
  },
  show_panel_user: function(a) {
   a.preventDefault();
   $(a.currentTarget).next().slideToggle("fast")
  },
  upload_license: function(a) {
   a.preventDefault();
   a = window.location;
   "" === a.search ? window.open(a.href + "upload.html", "_self") : window.open(a.origin + "/upload.html", "_self")
  }
 }),
 AboutModal = Modal.extend({
  type: "info",
  events: {
   "click a": "close"
  },
  message: Settings.VERSION + '\x3cbr\x3e\x3ca href\x3d"http://saiku.meteorite.bi" target\x3d"_blank"\x3ehttp://saiku.meteorite.bi\x3c/a\x3e\x3cbr\x3e\x3cbr\x3e\x3ch2 class\x3d"i18n"\x3eLicense Type\x3c/h2\x3e\x3cspan class\x3d"licensetype"/\x3e - \x3cspan class\x3d"i18n"\x3eExpires:\x3c/span\x3e \x3cspan class\x3d"licenseexpr"/\x3e\x3cbr/\x3e\x3cspan class\x3d"i18n"\x3eNumber of users:\x3c/span\x3e \x3cspan class\x3d"licenseuserlimit"/\x3e\x3cbr/\x3e\x3cspan class\x3d"i18n"\x3eLicensed to:\x3c/span\x3e \x3cspan class\x3d"licensename"/\x3e - \x3cspan class\x3d"licenseemail"/\x3e\x3cbr/\x3e\x3cdiv id\x3d"licensetable"\x3e\x3ch2\x3eUnlicenced User Quota\x3c/h2\x3e\x3cbr/\x3e\x3cdiv class\x3d"table-wrapper"\x3e\x3cdiv class\x3d"table-scroll"\x3e\x3ctable\x3e\x3cthead\x3e\x3ctr\x3e\x3cth\x3e\x3cspan class\x3d"text"\x3eUsername\x3c/span\x3e\x3c/th\x3e\x3cth\x3e\x3cspan class\x3d"text"\x3eLogins Remaining\x3c/span\x3e\x3c/th\x3e\x3c/tr\x3e\x3c/thead\x3e\x3ctbody\x3e\x3ctr id\x3d"quotareplace"/\x3e\x3c/tbody\x3e\x3c/table\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e\x3cstrong\x3e\x3ca href\x3d"http://www.meteorite.bi/saiku-pricing" class\x3d"i18n" target\x3d"_blank"\x3eOrder more licenses here\x3c/a\x3e\x3c/strong\x3e\x3cbr/\x3ePowered by \x3cimg src\x3d"images/src/meteorite_free.png" width\x3d"20px"\x3e \x3ca href\x3d"http://www.meteorite.bi/services/consulting" target\x3d"_blank"\x3ewww.meteorite.bi\x3c/a\x3e\x3cbr/\x3e',
  initialize: function() {
   this.options.title = '\x3cspan class\x3d"i18n"\x3eAbout\x3c/span\x3e ' + Settings.VERSION
  },
  ObjectLength_Modern: function(a) {
   return Object.keys(a).length
  },
  ObjectLength_Legacy: function(a) {
   var b = 0,
    c;
   for (c in a) a.hasOwnProperty(c) && ++b;
   return b
  },
  render: function() {
   $(this.el).html(this.template()).addClass("dialog_" + this.type).dialog(this.options);
   var a = $(".ui-dialog-title");
   a.html(this.options.title);
   a.addClass("i18n");
   Saiku.i18n.translate();
   license = new License;
   void 0 != Settings.LICENSE.expiration &&
    (yourEpoch = parseFloat(Settings.LICENSE.expiration), a = new Date(yourEpoch), $(this.el).find(".licenseexpr").text(a.toLocaleDateString()));
   void 0 != Settings.LICENSE.licenseType ? ($(this.el).find(".licensetype").text(Settings.LICENSE.licenseType), $(this.el).find(".licensename").text(Settings.LICENSE.name), $(this.el).find(".licenseuserlimit").text(Settings.LICENSE.userLimit), $(this.el).find(".licenseemail").text(Settings.LICENSE.email)) : $(this.el).find(".licensetype").text("Open Source License");
   ObjectLength =
    Object.keys ? this.ObjectLength_Modern : this.ObjectLength_Legacy;
   if (void 0 != Settings.LICENSEQUOTA && 0 < ObjectLength(Settings.LICENSEQUOTA)) {
    var b = "",
     c = !1;
    $.each(Settings.LICENSEQUOTA, function() {
     var a = "";
     $.each(this, function(b, c) {
      a += "\x3ctd\x3e" + c + "\x3c/td\x3e"
     });
     b += '\x3ctr class\x3d"' + (c ? "odd" : "even") + '"\x3e' + a + "\x3c/tr\x3e";
     c = !c
    });
    $(this.el).find("#quotareplace").replaceWith(b)
   } else $(this.el).find("#licensetable").hide();
   return this
  },
  close: function(a) {
   "#close" === a.target.hash && a.preventDefault();
   this.$el.dialog("destroy").remove()
  }
 }),
 OverwriteModal = Modal.extend({
  type: "info",
  message: "Are you sure you want to overwrite the existing query?",
  buttons: [{
   text: "Yes",
   method: "save"
  }, {
   text: "No",
   method: "close"
  }],
  initialize: function(a) {
   _.extend(this, a);
   this.options.title = "Warning";
   this.queryname = this.name;
   this.queryfolder = this.foldername;
   this.parentobj = this.parent
  },
  dummy: function() {
   return !0
  },
  save: function(a) {
   a.preventDefault();
   this.parentobj.save_remote(this.queryname, this.queryfolder, this.parentobj);
   $(this.el).dialog("destroy").remove()
  }
 }),
 AddFolderModal = Modal.extend({
  type: "save",
  closeText: "Save",
  events: {
   "click .form_button": "save",
   "submit form": "save"
  },
  buttons: [{
   text: "OK",
   method: "save"
  }],
  initialize: function(a) {
   this.success = a.success;
   this.path = a.path;
   this.message = "\x3cform id\x3d'add_folder'\x3e\x3clabel class\x3d'i18n' for\x3d'name'\x3eTo add a new folder, please type a name in the text box below:\x3c/label\x3e\x3cinput type\x3d'text' class\x3d'form-control newfolder' name\x3d'name' /\x3e\x3c/form\x3e";
   _.extend(this.options, {
    title: "Add Folder"
   });
   if (isIE && 9 > isIE) $(this.el).find("form").on("submit", this.save)
  },
  save: function(a) {
   a.preventDefault();
   a = $(this.el).find('input[name\x3d"name"]').val();
   (new SavedQuery({
    file: this.path + a,
    name: a
   })).save({}, {
    success: this.success,
    dataType: "text",
    error: this.error
   });
   this.close();
   return !1
  },
  error: function() {
   $(this.el).find("dialog_body").html("Could not add new folder")
  }
 }),
 FilterModal = Modal.extend({
  type: "filter",
  closeText: "Save",
  events: {
   "click .dialog_footer a": "call",
   "click .insert-member": "open_select_member_selector"
  },
  buttons: [{
   text: "OK",
   method: "save"
  }, {
   text: "Cancel",
   method: "close"
  }, {
   text: "Help",
   method: "help"
  }],
  message: "",
  expression_text: function() {
   var a = "\x3cdiv class\x3d'sidebar'\x3e\x3ctable border\x3d'0px'\x3e";
   "Order" == this.expressionType && (a += "\x3ctr\x3e\x3ctd class\x3d'col1'\x3e\x3clabel\x3eSort Type\x3c/label\x3e \x3cselect class\x3d'form-control' id\x3d'fun'\x3e\x3coption\x3eASC\x3c/option\x3e\x3coption\x3eBASC\x3c/option\x3e\x3coption\x3eDESC\x3c/option\x3e\x3coption\x3eBDESC\x3c/option\x3e \x3c/select\x3e\x3c/td\x3e\x3c/tr\x3e");
   return a += "\x3ctr\x3e\x3ctd class\x3d'col1'\x3e" + this.expressionType + " MDX Expression:\x3c/td\x3e\x3c/tr\x3e\x3ctr\x3e\x3ctd class\x3d'col1' style\x3d'width:380px'\x3e\x3cdiv class\x3d'filter-editor' style\x3d'width:380px' id\x3d'" + this.id + "'\x3e\x3c/div\x3e\x3c/td\x3e\x3c/tr\x3e\x3c/table\x3e\x3ca href\x3d'#' class\x3d'form_button btn btn-default insert-member'\x3eInsert Member\x3c/a\x3e\x3c/div\x3e"
  },
  expression: " ",
  expressonType: "",
  initialize: function(a) {
   var b = this;
   this.id = _.uniqueId("filter-modal-");
   this.workspace = a.workspace;
   this.axis = a.axis;
   this.query = a.query;
   this.success = a.success;
   this.expression = a.expression;
   this.expressionType = a.expressionType;
   _.bindAll(this, "save", "expression_text");
   _.extend(this.options, {
    title: "Custom " + this.expressionType + " for " + this.axis
   });
   this.message = this.expression_text(this.expressionType);
   this.bind("open", function() {
    $(this.el).find(".sidebar").width(380);
    this.editor = ace.edit(this.id);
    this.editor.setValue(b.expression);
    this.editor.setShowPrintMargin(!1);
    this.editor.setFontSize(11)
   });
   if (isIE && 9 > isIE) $(this.el).find("form").on("submit", this.save)
  },
  save: function(a) {
   a.preventDefault();
   this.expression = $(this.el).find("textarea").val();
   a = "";
   "undefined" != typeof this.expression && this.expression && "" !== this.expression ? ("Order" == this.expressionType ? (a = $("#fun").val(), this.success(a, this.expression)) : this.success(this.expression), this.close()) : (a += "You have to enter a MDX expression for the " + this.expressionType + " function! ", alert(a));
   return !1
  },
  error: function() {
   $(this.el).find("dialog_body").html("Could not add new folder")
  },
  open_select_member_selector: function(a) {
   a.preventDefault();
   a = this.$el.find("#cms-dimension option:selected").val();
   var b = this.$el.find("#cms-dimension option:selected").text(),
    c = this.$el.find("#cms-dimension option:selected").data("dimension");
   this.$el.find("#cms-dimension option:selected").data("type");
   var d = ace.edit(this.id),
    e = this;
   (new ParentMemberSelectorModal({
    dialog: this,
    workspace: this.workspace,
    cube: this.workspace.selected_cube,
    dimensions: Saiku.session.sessionworkspace.cube[this.workspace.selected_cube].get("data").dimensions,
    selectDimension: a,
    dimension: c,
    hierarchy: b,
    uniqueName: this.pmUniqueName,
    lastLevel: this.pmLevel,
    breadcrumbs: this.pmBreadcrumbs,
    select_type: "select_member",
    selected_member: this.selected_member,
    close_callback: function(a) {
     e.close_select_modal(d, a)
    }
   })).render().open();
   this.$el.parents(".ui-dialog").find(".ui-dialog-title").text("Custom Filter")
  },
  close_select_modal: function(a, b) {
   a.insert(b)
  },
  help: function() {
   window.open("http://wiki.meteorite.bi/display/SAIK/Filtering")
  }
 }),
 CustomFilterModal = Modal.extend({
  type: "filter",
  closeText: "Save",
  events: {
   "submit form": "save",
   "change .function": "switch_function",
   "change .type": "switch_type",
   "click .dialog_footer a": "call"
  },
  buttons: [{
   text: "OK",
   method: "save"
  }, {
   text: "Cancel",
   method: "close"
  }],
  message: "\x3cform id\x3d'custom_filter'\x3e\x3ctable border\x3d'0px'\x3e\x3ctr\x3e\x3ctd class\x3d'col0'\x3eDefine Filter\x3cselect class\x3d'form-control function'\x3e\x3coption\x3eSelect a Function...\x3c/option\x3e\x3coption value\x3d'TopCount'\x3eTopCount\x3c/option\x3e\x3coption value\x3d'TopPercent'\x3eTopPercent\x3c/option\x3e\x3coption value\x3d'TopSum'\x3eTopSum\x3c/option\x3e\x3coption value\x3d'BottomCount'\x3eBottomCount\x3c/option\x3e\x3coption value\x3d'BottomPercent'\x3eBottomPercent\x3c/option\x3e\x3coption value\x3d'BottomSum'\x3eBottomSum\x3c/option\x3e\x3c/select\x3e\x3c/td\x3e\x3c/tr\x3e\x3ctr class\x3d'filter_details hide'\x3e\x3ctd\x3e\x3cspan class\x3d'ntype'\x3e\x3c/span\x3e\x3cinput class\x3d'n form-control' /\x3e\x3c/td\x3e\x3c/tr\x3e\x3ctr class\x3d'filter_details hide'\x3e\x3ctd\x3eSort by\x3cselect class\x3d'type form-control'\x3e\x3coption value\x3d'measure'\x3eMeasure\x3c/option\x3e\x3coption value\x3d'custom'\x3eMDX Expression\x3c/option\x3e\x3c/select\x3e\x3c/td\x3e\x3c/tr\x3e\x3ctr class\x3d'filter_details hide sortingoption'\x3e\x3ctd\x3e\x26nbsp; \x26nbsp;\x3c/td\x3e\x3c/table\x3e\x3c/form\x3e",
  func: null,
  func_type: "Measure",
  n: "",
  sortliteral: "",
  measure_list: null,
  initialize: function(a) {
   var b = this;
   this.axis = a.axis;
   this.measures = a.measures;
   this.query = a.query;
   this.success = a.success;
   this.func = a.func;
   this.n = a.n;
   this.sortliteral = a.sortliteral;
   this.isMdx = !0;
   _.bindAll(this, "build_measures_list", "save");
   this.measure_list = this.build_measures_list();
   _.extend(this.options, {
    title: "Custom Filter for " + this.axis
   });
   this.bind("open", function() {
    null !== b.func && ($(b.el).find(".function").val(b.func), b.switch_function({
      target: $(b.el).find(".function")
     }),
     $(b.el).find(".n").val(b.n), !0 === b.isMdx && null !== b.sortliteral && ($(this.el).find(".type").val("custom"), $(this.el).find(".sortingoption").html("").html("\x3ctextarea class\x3d'form-control sortliteral'\x3e" + b.sortliteral + "\x3c/textarea\x3e")))
   });
   if (isIE && 9 > isIE) $(this.el).find("form").on("submit", this.save)
  },
  build_measures_list: function() {
   var a = this;
   if (null !== this.measure_list) return "";
   var b = "\x3cselect class\x3d'form-control sortliteral'\x3e";
   _.each(this.measures, function(c) {
    var d = "";
    c.uniqueName ==
     a.sortliteral && (d = " selected ", a.isMdx = !1);
    b += "\x3coption " + d + "value\x3d'" + c.uniqueName + "'\x3e" + c.caption + "\x3c/option\x3e"
   });
   return b += "\x3c/select\x3e"
  },
  switch_function: function(a) {
   a = $(a.target).val();
   "undefined" == typeof a || "" === a ? $(this.el).find(".filter_details").hide() : (a = a.replace("Top", "").replace("Bottom", ""), $(this.el).find(".ntype").html(a + ":"), $(this.el).find(".filter_details").show(), $(this.el).find(".sortingoption").html("").html(this.measure_list));
   return !1
  },
  switch_type: function(a) {
   "measure" ==
   $(a.target).val() ? $(this.el).find(".sortingoption").html("").html(this.measure_list) : $(this.el).find(".sortingoption").html("").html("\x3ctextarea class\x3d'form-control sortliteral' /\x3e");
   return !1
  },
  save: function(a) {
   a.preventDefault();
   this.func = $(this.el).find(".function").val();
   this.n = parseInt($(this.el).find(".n").val());
   this.sortliteral = $(this.el).find(".sortliteral").val();
   a = "";
   "undefined" != typeof this.n && this.n || (a += "You have to enter a numeric for N! ");
   "undefined" != typeof this.sortliteral &&
    this.sortliteral && "" !== this.sortliteral || (a += "You have to enter a MDX expression for the sort literal! ");
   "" !== a ? alert(a) : (this.success(this.func, this.n, this.sortliteral), this.close());
   return !1
  },
  error: function() {
   $(this.el).find("dialog_body").html("Could not add new folder")
  }
 }),
 CalculatedMemberModal = Modal.extend({
  type: "calculated-member",
  template_modal: _.template('\x3cdiv class\x3d"cms-container-group"\x3e\x3cdiv class\x3d"calculated-measure-group"\x3e\x3ch4 class\x3d"i18n"\x3eCalculated Measures:\x3c/h4\x3e\x3cdiv class\x3d"cms-box"\x3e\x3ctable class\x3d"cms-list measures-list"\x3e\x3c%\x3d tplCalculatedMeasures %\x3e\x3c/table\x3e\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"calculated-member-group"\x3e\x3ch4 class\x3d"i18n"\x3eCalculated Members:\x3c/h4\x3e\x3cdiv class\x3d"cms-box"\x3e\x3ctable class\x3d"cms-list members-list"\x3e\x3c%\x3d tplCalculatedMembers %\x3e\x3c/table\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"cms-container-form"\x3e\x3cform class\x3d"form-group-inline" data-action\x3d"cad"\x3e\x3cdiv class\x3d"form-group"\x3e\x3clabel for\x3d"cms-name" class\x3d"i18n"\x3eName:\x3c/label\x3e\x3cinput type\x3d"text" class\x3d"form-control" id\x3d"cms-name" autofocus\x3e\x3c/div\x3e\x3cdiv class\x3d"cms-measure form-inline" style\x3d"padding-bottom:10px;"\x3e\x3clabel for\x3d"cms-measure" class\x3d"i18n"\x3eInsert Member:\x3c/label\x3e \x3cinput type\x3d"button" class\x3d"form-control btn-primary btn btn-select-member" value\x3d"Select Member" title\x3d"Insert a member into the formula editor "   id\x3d"insertmember"\x3e \x3c/input\x3e \x3c/div\x3e\x3clabel for\x3d"\x3c%\x3d idEditor %\x3e" class\x3d"i18n"\x3eFormula:\x3c/label\x3e\x3cdiv class\x3d"formula-editor" style\x3d"padding-bottom:10px" id\x3d"\x3c%\x3d idEditor %\x3e"\x3e\x3c/div\x3e\x3cdiv class\x3d"btn-groups"\x3e\x3ca class\x3d"form_button btn btn-default minimal_padding btn-math" href\x3d"#add_math_operator_formula" data-math\x3d"+"\x3e\x26nbsp;+\x26nbsp;\x3c/a\x3e\x3ca class\x3d"form_button btn btn-default btn-math minimal_padding" href\x3d"#add_math_operator_formula" data-math\x3d"-"\x3e\x26nbsp;-\x26nbsp;\x3c/a\x3e\x3ca class\x3d"form_button btn btn-default btn-math minimal_padding" href\x3d"#add_math_operator_formula" data-math\x3d"*"\x3e\x26nbsp;*\x26nbsp;\x3c/a\x3e\x3ca class\x3d"form_button btn btn-default btn-math minimal_padding" href\x3d"#add_math_operator_formula" data-math\x3d"/"\x3e\x26nbsp;/\x26nbsp;\x3c/a\x3e\x3ca class\x3d"form_button btn btn-default btn-math minimal_padding" href\x3d"#add_math_operator_formula" data-math\x3d"("\x3e\x26nbsp;(\x26nbsp;\x3c/a\x3e\x3ca class\x3d"form_button btn btn-default btn-math minimal_padding" href\x3d"#add_math_operator_formula" data-math\x3d")"\x3e\x26nbsp;)\x26nbsp;\x3c/a\x3e\x3ca class\x3d"form_button btn btn-default btn-math minimal_padding i18n" href\x3d"#add_math_operator_formula" data-math\x3d"and"\x3e\x26nbsp;and\x26nbsp;\x3c/a\x3e\x3ca class\x3d"form_button btn btn-default btn-math minimal_padding i18n" href\x3d"#add_math_operator_formula" data-math\x3d"or"\x3e\x26nbsp;or\x26nbsp;\x3c/a\x3e\x3ca class\x3d"form_button btn btn-default btn-math minimal_padding i18n" href\x3d"#add_math_operator_formula" data-math\x3d"not"\x3e\x26nbsp;not\x26nbsp;\x3c/a\x3e\x3cbr/\x3e\x3cdiv class\x3d"form-inline"\x3e\x3cselect class\x3d"cms-functionlist form-control"\x3e\x3coption value\x3d""\x3e---Insert MDX Function---\x3c/select\x3e\x26nbsp; \x3ca href\x3d"" class\x3d"cms-doclink" target\x3d"_blank" style\x3d"display: none;"\x3eDocumentation\x3c/a\x3e\x3cbr/\x3e\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"cms-function"\x3e\x3clabel for\x3d"cms-function" class\x3d"i18n"\x3eFunctions:\x3c/label\x3e \x3cinput type\x3d"button" class\x3d"form_button btn btn-primary growthBtn"# value\x3d"Predefined Calculations"           title\x3d"Calculate difference. Good to calculate previous period growth "   id\x3d"growthBtn" \x3e  \x3c/input\x3e  \x3cinput type\x3d"button" class\x3d"form_button btn btn-primary formatBtn" value\x3d"Format %" id\x3d"formatBtn"  title\x3d"Post-process step: format this view as percentage of rows, columns or grand total. " /\x3e\x3c/div\x3e\x3cbr/\x3e\x3cdiv style\x3d"padding-bottom:10px;"\x3e\x3clabel for\x3d"cms-dimension" class\x3d"i18n"\x3eDimension:\x3c/label\x3e\x3cselect id\x3d"cms-dimension" class\x3d"form-control" style\x3d"width:365px"\x3e\x3coption class\x3d"i18n" value\x3d"" selected\x3e-- Select an existing dimension --\x3c/option\x3e\x3c% if (measures.length \x3e 0) { %\x3e\x3coptgroup label\x3d"\x3c%\x3d dataMeasures.name %\x3e"\x3e\x3coption value\x3d"\x3c%\x3d dataMeasures.uniqueName %\x3e" data-type\x3d"calcmeasure"\x3e\x3c%\x3d dataMeasures.name %\x3e\x3c/option\x3e\x3c/optgroup\x3e\x3c% } %\x3e\x3c% _(dimensions).each(function(dimension) { %\x3e\x3coptgroup label\x3d"\x3c%\x3d dimension.name %\x3e"\x3e\x3c% _(dimension.hierarchies).each(function(hierarchy) { %\x3e\x3coption value\x3d"\x3c%\x3d hierarchy.uniqueName %\x3e" data-dimension\x3d"\x3c%\x3d dimension.name %\x3e" data-type\x3d"calcmember"\x3e\x3c%\x3d hierarchy.name %\x3e\x3c/option\x3e\x3c% }); %\x3e\x3c/optgroup\x3e\x3c% }); %\x3e\x3c/select\x3e\x3c/div\x3e\x3c% if (Settings.BIPLUGIN5 \x3d\x3d false) { %\x3e\x3cdiv class\x3d"btn-groups" style\x3d"padding-bottom:10px"\x3e\x3ca class\x3d"form_button btn btn-primary btn-parent-member" href\x3d"#add_math_operator_formula" disabled\x3e\x26nbsp;Parent Member Selector\x26nbsp;\x3c/a\x3e\x3ca class\x3d"form_button btn btn-default btn-clear-parent" href\x3d"#add_math_operator_formula" disabled\x3e\x26nbsp;Clear Parent Member\x26nbsp;\x3c/a\x3e\x3c/div\x3e\x3clabel class\x3d"i18n" for\x3d"cms-pmember"\x3eParent Member:\x3c/label\x3e\x3cinput class\x3d"form-control" readonly\x3d"true" type\x3d"text" id\x3d"cms-pmember"\x3e\x3cbr/\x3e\x3c% } %\x3e\x3cdiv style\x3d"padding-bottom:10px;"\x3e\x3clabel for\x3d"cms-format" class\x3d"i18n"\x3eFormat:\x3c/label\x3e\x3cselect id\x3d"cms-format" class\x3d"form-control" style\x3d"width:365px"\x3e\x3coption class\x3d"i18n" value\x3d"" selected\x3e-- Select a format --\x3c/option\x3e\x3coption class\x3d"i18n" value\x3d"custom"\x3eCustom\x3c/option\x3e\x3coption class\x3d"i18n" value\x3d"#,##0.00"\x3e#,##0.00 Decimal\x3c/option\x3e\x3coption class\x3d"i18n" value\x3d"#,###"\x3e#,### Integer\x3c/option\x3e\x3coption class\x3d"i18n" value\x3d"##.##%"\x3e##.##% Decimal percentage\x3c/option\x3e\x3coption class\x3d"i18n" value\x3d"##%"\x3e##% Integer percentage\x3c/option\x3e\x3coption class\x3d"i18n" value\x3d"mmmm dd yyyy"\x3emmmm dd yyyy Month Day Year\x3c/option\x3e\x3coption class\x3d"i18n" value\x3d"mmmm yyyy"\x3emmmm yyyy Month Year\x3c/option\x3e\x3coption class\x3d"i18n" value\x3d"yyyy-mm-dd"\x3eyyyy-mm-dd ISO format date\x3c/option\x3e\x3coption class\x3d"i18n" value\x3d"yyyy-mm-dd hh:mi:ss"\x3eyyyy-mm-dd hh:mi:ss Date and time\x3c/option\x3e\x3coption class\x3d"i18n" value\x3d"##h ##m"\x3e##h ##m Minutes\x3c/option\x3e\x3c/select\x3e\x3c/div\x3e\x3cdiv class\x3d"div-format-custom" style\x3d"padding-bottom:10px"\x3e\x3clabel for\x3d"cms-format-custom" class\x3d"i18n"\x3eFormat Custom:\x3c/label\x3e\x3cinput type\x3d"text" class\x3d"form-control" id\x3d"cms-format-custom" value\x3d"" placeholder\x3d"Add a custom format"\x3e\x3c/div\x3e\x3c/form\x3e\x3c/div\x3e'),
  buttons: [{
   text: "Add",
   method: "save"
  }, {
   text: "Update",
   method: "save"
  }, {
   text: "New",
   method: "new"
  }, {
   text: "Cancel",
   method: "close"
  }, {
   text: "Help",
   method: "help"
  }],
  events: {
   "click  .dialog_footer a": "call",
   "blur   #cms-name": "trigger_input_name",
   "change #cms-measure": "add_measure_formula",
   "click  .btn-math": "add_math_operator_formula",
   "change #cms-dimension": "type_dimension",
   "change #cms-format": "type_format",
   "click  .btn-action-edit": "edit_cms",
   "click  .btn-action-del": "show_del_cms",
   "click  .form_button.growthBtn": "openGrowthModal",
   "click  .form_button.formatBtn": "openFormatModal",
   "click  .btn-parent-member": "open_parent_member_selector",
   "click  .btn-clear-parent": "reset_parent_member",
   "click .cms-functionlist": "change_function_list",
   "click .btn-select-member": "open_select_member_selector"
  },
  initialize: function(a) {
   _.extend(this, a);
   this.workspace = a.workspace;
   this.options.title = "Calculated Member";
   this.id = _.uniqueId("cms-formula-");
   var b = this,
    c = this.workspace.selected_cube;
   a = Saiku.session.sessionworkspace.cube[c].get("data").measures;
   var c = Saiku.session.sessionworkspace.cube[c].get("data").dimensions,
    d = this.workspace.query.helper.getCalculatedMeasures(),
    e = this.workspace.query.helper.getCalculatedMembers(),
    d = this.template_cms(d, "calcmeasure"),
    e = this.template_cms(e, "calcmember"),
    f = {
     name: a ? a[0].dimensionUniqueName.replace(/[\[\]]/gi, "") : null,
     uniqueName: a ? a[0].hierarchyUniqueName : null
    };
   Saiku.ui.block('\x3cspan class\x3d"i18n"\x3eLoading...\x3c/span\x3e');
   this.message = this.template_modal({
    tplCalculatedMeasures: d,
    tplCalculatedMembers: e,
    idEditor: this.id,
    measures: a,
    dataMeasures: f,
    dimensions: c
   });
   this.bind("open", function() {
    this.populate_function_list();
    var a = this.$el.find(".cms-container-form").height();
    this.post_render();
    this.$el.find(".dialog_footer a:nth-child(2)").hide();
    this.$el.find(".dialog_footer a:nth-child(3)").hide();
    this.$el.find(".cms-container-group").height(a);
    this.$el.find(".calculated-measure-group").height(a / 2);
    this.$el.find(".calculated-member-group").height(a / 2);
    _.defer(function() {
     b.start_editor()
    })
   });
   Saiku.session.bind("ParentMemberSelectorModal:save",
    this.add_selected_dimension)
  },
  add_selected_dimension: function(a) {
   console.log(a);
   a.dialog.$el.find("#cms-dimension").val(a.selectedDimension)
  },
  post_render: function() {
   var a = ($("body").height() - 570) / 2 * 100 / $("body").height(),
    b = ($("body").width() - 800) / 2 * 100 / $("body").width();
   this.$el.dialog("option", "position", "center");
   this.$el.parents(".ui-dialog").css({
    width: "800px",
    top: a + "%",
    left: b + "%"
   })
  },
  start_editor: function() {
   this.formulaEditor = ace.edit(this.id);
   this.formulaEditor.getSession().setMode("ace/mode/text");
   this.formulaEditor.getSession().setUseWrapMode(!0);
   Saiku.ui.unblock()
  },
  template_cms: function(a, b) {
   var c = this,
    d = "";
   a && 0 !== a.length ? "calcmeasure" === b ? _.each(a, function(a) {
    d += '\x3ctr class\x3d"row-cms-' + c.replace_cms(a.name) + '"\x3e\x3ctd class\x3d"cms-name"\x3e' + a.name + '\x3c/td\x3e\x3ctd class\x3d"cms-actions"\x3e\x3ca class\x3d"edit button sprite btn-action-edit" href\x3d"#edit_cms" data-name\x3d"' + a.name + '" data-type\x3d"calcmeasure"\x3e\x3c/a\x3e\x3ca class\x3d"delete button sprite btn-action-del" href\x3d"#show_del_cms" data-name\x3d"' +
     a.name + '" data-type\x3d"calcmeasure"\x3e\x3c/a\x3e\x3c/td\x3e\x3c/tr\x3e'
   }) : _.each(a, function(a) {
    -1 == a.name.indexOf("*TOTAL_MEMBER_SEL~SUM") && (d += '\x3ctr class\x3d"row-cms-' + c.replace_cms(a.name) + '"\x3e\x3ctd class\x3d"cms-name"\x3e' + a.name + '\x3c/td\x3e\x3ctd class\x3d"cms-actions"\x3e\x3ca class\x3d"edit button sprite btn-action-edit" href\x3d"#edit_cms" data-name\x3d"' + a.name + '" data-type\x3d"calcmember"\x3e\x3c/a\x3e\x3ca class\x3d"delete button sprite btn-action-del" href\x3d"#show_del_cms" data-name\x3d"' +
     a.name + '" data-type\x3d"calcmember"\x3e\x3c/a\x3e\x3c/td\x3e\x3c/tr\x3e')
   }) : d = "calcmeasure" === b ? '\x3cp class\x3d"msg-no-cms i18n"\x3eNo calculated measures created\x3c/p\x3e' : '\x3cp class\x3d"msg-no-cms i18n"\x3eNo calculated members created\x3c/p\x3e';
   return d
  },
  replace_cms: function(a) {
   return a = a.replace(/\s/g, "-")
  },
  edit_cms: function(a) {
   a.preventDefault();
   var b = this,
    c = $(a.currentTarget);
   a = "calcmeasure" === c.data("type") ? this.workspace.query.helper.getCalculatedMeasures() : this.workspace.query.helper.getCalculatedMembers();
   this.$el.find(".cms-actions a").removeClass("on");
   _.each(a, function(a) {
    a.name === c.data("name") && (c.addClass("on"), b.$el.find("#cms-name").val(a.name), b.formulaEditor.setValue(a.formula), b.$el.find("#cms-dimension").val(a.hierarchyName), b.$el.find("#cms-pmember").val(a.parentMember), 0 !== $('#cms-format option[value\x3d"' + a.properties.FORMAT_STRING + '"]').length || void 0 === a.properties.FORMAT_STRING && 0 === $('#cms-format option[value\x3d"' + a.properties.FORMAT_STRING + '"]').length ? (b.$el.find("#cms-format").val(a.properties.FORMAT_STRING),
     b.$el.find(".div-format-custom").hide()) : (b.$el.find("#cms-format").prop("selectedIndex", 1), b.$el.find(".div-format-custom").show(), b.$el.find("#cms-format-custom").val(a.properties.FORMAT_STRING)), b.pmUniqueName = a.parentMember || "", b.pmLevel = a.parentMemberLevel || "", b.lastLevel = a.previousLevel || "", b.pmBreadcrumbs = a.parentMemberBreadcrumbs || [], b.actualLevel = a.assignedLevel || "", b.type_dimension(), b.$el.find(".form-group-inline").data("action", "edit"), b.$el.find(".form-group-inline").data("oldcms", a.name))
   });
   this.$el.find(".dialog_footer a:nth-child(1)").hide();
   this.$el.find(".dialog_footer a:nth-child(2)").show();
   this.$el.find(".dialog_footer a:nth-child(3)").show()
  },
  show_del_cms: function(a) {
   a.preventDefault();
   a = $(a.currentTarget);
   var b = "calcmeasure" === a.data("type") ? '\x3cspan class\x3d"i18n"\x3emeasure\x3c/span\x3e' : '\x3cspan class\x3d"i18n"\x3emember\x3c/span\x3e';
   this.$delcms = a;
   this.new();
   (new WarningModal({
    title: '\x3cspan class\x3d"i18n"\x3eDelete Member\x3c/span\x3e',
    message: '\x3cspan class\x3d"i18n"\x3eYou want to delete this\x3c/span\x3e ' +
     b + " \x3cb\x3e" + a.data("name") + "\x3c/b\x3e?",
    okay: this.del_cms,
    okayobj: this
   })).render().open();
   this.$el.parents(".ui-dialog").find(".ui-dialog-title").text("Calculated Member");
   Saiku.i18n.translate()
  },
  del_cms: function(a) {
   a.$delcms.parent().closest(".row-cms-" + a.replace_cms(a.$delcms.data("name"))).remove();
   "calcmeasure" === a.$delcms.data("type") ? a.workspace.query.helper.removeCalculatedMeasure(a.$delcms.data("name")) : a.workspace.query.helper.removeCalculatedMember(a.$delcms.data("name"));
   a.workspace.sync_query();
   a.workspace.drop_zones.set_measures();
   a.new();
   a.check_len_cms(a.$delcms.data("type")) || ("calcmeasure" === a.$delcms.data("type") ? a.$el.find(".measures-list").append('\x3cp class\x3d"msg-no-cms i18n"\x3eNo calculated measures created\x3c/p\x3e') : a.$el.find(".members-list").append('\x3cp class\x3d"msg-no-cms i18n"\x3eNo calculated members created\x3c/p\x3e'));
   Saiku.i18n.translate()
  },
  trigger_input_name: function() {
   var a = this.$el.find(".form-group-inline").data("action"),
    b = this.$el.find("#cms-name").val(),
    c = this.$el.find("#cms-dimension option:selected").data("type"),
    d = "";
   "calcmeasure" === c ? this.check_name_cms(c, b) && "cad" === a && (d = "Exists a measure with the same name added!") : "calcmember" === c ? this.check_name_cms(c, b) && "cad" === a && (d = "Exists a member with the same name added!") : this.check_name_cms(c, b) && "cad" === a && (d = "Exists a measure or member with the same name added!");
   "" !== d && alert(d)
  },
  check_name_cms: function(a, b) {
   var c = "calcmeasure" === a ? this.workspace.query.helper.getCalculatedMeasures() : this.workspace.query.helper.getCalculatedMembers();
   if (null === a || void 0 === a) var d = this.workspace.query.helper.getCalculatedMeasures(),
    e = this.workspace.query.helper.getCalculatedMembers(),
    c = [],
    c = c.concat(d, e);
   for (; 0 < c.length;) return c[0].name === b ? !0 : !1
  },
  check_len_cms: function(a) {
   return 0 < ("calcmeasure" === a ? this.workspace.query.helper.getCalculatedMeasures() : this.workspace.query.helper.getCalculatedMembers()).length ? !0 : !1
  },
  reset_form: function() {
   this.$el.find("#cms-name").val("");
   this.$el.find("#cms-measure").prop("selectedIndex", 0);
   this.formulaEditor.setValue("");
   this.$el.find("#cms-dimension").prop("selectedIndex", 0);
   this.$el.find("#cms-format").prop("selectedIndex", 0);
   this.$el.find(".div-format-custom").hide();
   this.$el.find("#cms-format-custom").val("");
   this.reset_parent_member();
   this.type_dimension()
  },
  reset_dropdown: function() {
   this.$el.find("#cms-measure").prop("selectedIndex", 0)
  },
  reset_parent_member: function() {
   this.pmLevel = this.pmUniqueName = "";
   this.pmBreadcrumbs = [];
   this.$el.find("#cms-pmember").val("")
  },
  add_measure_formula: function(a) {
   a.preventDefault();
   a = this.$el.find("#cms-measure option:selected").val();
   var b = this.formulaEditor.getValue();
   this.formulaEditor.setValue(b + a);
   this.reset_dropdown()
  },
  add_math_operator_formula: function(a) {
   a.preventDefault();
   a = " " + $(a.currentTarget).data("math") + " ";
   var b = this.$el.find(".formula-editor").attr("id");
   ace.edit(b).insert(a)
  },
  type_dimension: function(a) {
   var b = this.$el.find("#cms-dimension option:selected").data("type");
   a && (a.preventDefault(), this.reset_parent_member());
   "calcmember" === b ? (this.$el.find(".btn-parent-member").removeAttr("disabled"),
    this.$el.find(".btn-clear-parent-member").removeAttr("disabled")) : (this.$el.find(".btn-parent-member").attr("disabled", "disabled"), this.$el.find(".btn-clear-parent-member").attr("disabled", "disabled"))
  },
  type_format: function(a) {
   a.preventDefault();
   "custom" === this.$el.find("#cms-format option:selected").val() ? this.$el.find(".div-format-custom").show() : this.$el.find(".div-format-custom").hide()
  },
  new: function(a) {
   a && a.preventDefault();
   this.$el.find(".cms-actions a").removeClass("on");
   this.$el.find(".form-group-inline").data("action",
    "cad");
   this.$el.find(".form-group-inline").data("oldcms", "");
   this.$el.find(".dialog_footer a:nth-child(1)").show();
   this.$el.find(".dialog_footer a:nth-child(2)").hide();
   this.$el.find(".dialog_footer a:nth-child(3)").hide();
   this.reset_form()
  },
  openGrowthModal: function(a) {
   a = function(a) {
    var b = [];
    _.each(a, function(a) {
     b.push(a.name)
    }, this);
    return b
   }(this.workspace.query.helper.model().queryModel.axes.ROWS.hierarchies.concat(this.workspace.query.helper.model().queryModel.axes.COLUMNS.hierarchies));
   var b =
    Saiku.session.sessionworkspace.cube[this.workspace.selected_cube].get("data").measures;
   this.close();
   (new GrowthModal({
    workspace: this.workspace,
    measures: b,
    dimensions: a
   })).render().open()
  },
  openFormatModal: function(a) {
   a = this.workspace.query.helper.model().queryModel.details.measures;
   this.close();
   (new FormatAsPercentageModal({
    workspace: this.workspace,
    measures: a
   })).render().open()
  },
  open_parent_member_selector: function(a) {
   a.preventDefault();
   a = this.$el.find("#cms-dimension option:selected").val();
   var b =
    this.$el.find("#cms-dimension option:selected").text(),
    c = this.$el.find("#cms-dimension option:selected").data("dimension");
   "calcmember" === this.$el.find("#cms-dimension option:selected").data("type") && ((new ParentMemberSelectorModal({
    dialog: this,
    workspace: this.workspace,
    cube: this.workspace.selected_cube,
    dimensions: Saiku.session.sessionworkspace.cube[this.workspace.selected_cube].get("data").dimensions,
    selectDimension: a,
    dimension: c,
    hierarchy: b,
    uniqueName: this.pmUniqueName,
    lastLevel: this.lastLevel,
    current_level: this.pmLevel,
    breadcrumbs: this.pmBreadcrumbs
   })).render().open(), this.$el.parents(".ui-dialog").find(".ui-dialog-title").text("Connection Details"))
  },
  save: function(a) {
   a.preventDefault();
   $(a.currentTarget);
   a = this.$el.find(".form-group-inline").data("oldcms");
   var b = this.$el.find("#cms-name").val(),
    c = this.formulaEditor.getValue(),
    d = this.$el.find("#cms-dimension option:selected").val(),
    e = this.$el.find("#cms-dimension option:selected").text(),
    f = this.$el.find("#cms-dimension option:selected").data("dimension"),
    g = this.$el.find("#cms-dimension option:selected").data("type"),
    h = this.$el.find("#cms-format option:selected").val(),
    k = this.$el.find(".form-group-inline").data("action"),
    l = "",
    h = "custom" === h ? this.$el.find("#cms-format-custom").val() : this.$el.find("#cms-format option:selected").val();
   "undefined" !== typeof b && "" !== b && b || (l += "You have to enter a name for the member! ");
   "undefined" !== typeof c && "" !== c && c || (l += "You have to enter a MDX formula for the calculated member! ");
   "undefined" !== typeof d && "" !== d && d || (l += "You have to choose a dimension for the calculated member! ");
   "" !== l ? alert(l) : ("calcmeasure" === g ? (c = {
    name: b,
    formula: c,
    properties: {},
    uniqueName: b,
    hierarchyName: d
   }, h && (c.properties.FORMAT_STRING = h), "cad" === k ? (this.workspace.query.helper.addCalculatedMeasure(c), this.workspace.sync_query()) : (this.workspace.query.helper.editCalculatedMeasure(a, c), this.workspace.sync_query(), this.workspace.drop_zones.set_measures())) : (c = {
    name: b,
    dimension: f,
    uniqueName: "[" + e + "].[" + b + "]",
    caption: b,
    properties: {},
    formula: c,
    hierarchyName: d,
    parentMember: "",
    parentMemberLevel: "",
    previousLevel: "",
    parentMemberBreadcrumbs: [],
    assignedLevel: ""
   }, h && (c.properties.FORMAT_STRING = h), this.pmUniqueName && !_.isEmpty(this.pmUniqueName) && (c.parentMember = this.pmUniqueName, c.parentMemberLevel = this.pmLevel, c.previousLevel = this.lastLevel, c.parentMemberBreadcrumbs = this.pmBreadcrumbs, c.uniqueName = this.pmUniqueName + ".[" + b + "]", c.assignedLevel = this.actualLevel), this.workspace.query.helper.includeCmember(d, c.uniqueName), "cad" === k ? (this.workspace.query.helper.addCalculatedMember(c), this.workspace.sync_query()) : (this.workspace.query.helper.removeLevelCalculatedMember(d,
    "[" + e + "].[" + a + "]"), this.workspace.query.helper.editCalculatedMember(a, c), this.workspace.sync_query(), this.workspace.drop_zones.set_measures())), this.$el.dialog("close"))
  },
  populate_function_list: function(a) {
   a = [{
    name: "Formula Not Empty Check",
    example: "Iif(NOT ISEMPTY([Measures].[My Measure]),([Measures].[My Measure] + [Numeric Expression]),null))",
    description: "Insert a formula with an ISEMPTY check to ensure that only non null cells are calculated",
    doc_link: "http://wiki.meteorite.bi/display/SAIK/Non+Empty+Calculated+Members"
   }, {
    name: "Aggregate",
    example: "Aggregate(Set_Expression [ ,Numeric_Expression ])",
    description: "Returns a number that is calculated by aggregating over the cells returned by the set expression.",
    doc_link: "https://msdn.microsoft.com/en-us/library/ms145524.aspx"
   }, {
    name: "Avg",
    example: "Avg( Set_Expression [ , Numeric_Expression ] )",
    description: "Evaluates a set and returns the average of the non empty values of the cells in the set, averaged over the measures in the set or over a specified measure.",
    doc_link: "https://msdn.microsoft.com/en-us/library/ms146067.aspx"
   }, {
    name: "Ancestor",
    example: "Ancestor(Member_Expression, Distance)",
    description: "A function that returns the ancestor of a specified member at a specified level or at a specified distance from the member.",
    doc_link: "https://msdn.microsoft.com/en-us/library/ms145616.aspx"
   }, {
    name: "ClosingPeriod",
    example: "ClosingPeriod( [ Level_Expression [ ,Member_Expression ] ] )",
    description: "Returns the member that is the last sibling among the descendants of a specified member at a specified level.",
    doc_link: "https://msdn.microsoft.com/en-us/library/ms145584.aspx"
   }, {
    name: "Cousin",
    example: "Cousin( Member_Expression , Ancestor_Member_Expression )",
    description: "Returns the child member with the same relative position under a parent member as the specified child member.",
    doc_link: "https://msdn.microsoft.com/en-us/library/ms145481.aspx"
   }, {
    name: "CurrentMember",
    example: "Hierarchy_Expression.CurrentMember",
    description: "Returns the current member along a specified hierarchy during iteration.",
    doc_link: "https://msdn.microsoft.com/en-us/library/ms144948.aspx"
   }, {
    name: "FirstChild",
    example: "Member_Expression.FirstChild",
    description: "Returns the first child of a specified member.",
    doc_link: "https://msdn.microsoft.com/en-us/library/ms144947.aspx"
   }, {
    name: "FirstSibling",
    example: "Member_Expression.FirstSibling",
    description: "Returns the first child of the parent of a member.",
    doc_link: "https://msdn.microsoft.com/en-us/library/ms145956.aspx"
   }, {
    name: "IIf",
    example: "IIf(Logical_Expression, Expression1, Expression2)",
    description: "Evaluates different branch expressions depending on whether a Boolean condition is true or false.",
    doc_link: "https://msdn.microsoft.com/en-us/library/ms145994.aspx"
   }, {
    name: "LastChild",
    example: "Member_Expression.LastChild",
    description: "Returns the last child of a specified member.",
    doc_link: "https://msdn.microsoft.com/en-us/library/ms145576.aspx"
   }, {
    name: "LastSibling",
    example: "Member_Expression.LastSibling",
    description: "Returns the last child of the parent of a specified member.",
    doc_link: "https://msdn.microsoft.com/en-us/library/ms144863.aspx"
   }, {
    name: "Max",
    example: "Max( Set_Expression [ , Numeric_Expression ] )",
    description: "Returns the maximum value of a numeric expression that is evaluated over a set.",
    doc_link: "https://msdn.microsoft.com/en-us/library/ms145601.aspx"
   }, {
    name: "Median",
    example: "Median(Set_Expression [ ,Numeric_Expression ] )",
    description: "Returns the median value of a numeric expression that is evaluated over a set.",
    doc_link: "https://msdn.microsoft.com/en-us/library/ms145570.aspx"
   }, {
    name: "Min",
    example: "Min( Set_Expression [ , Numeric_Expression ] )",
    description: "Returns the minimum value of a numeric expression that is evaluated over a set.",
    doc_link: "https://msdn.microsoft.com/en-us/library/ms145600.aspx"
   }, {
    name: "MTD",
    example: "Mtd( [ Member_Expression ] )",
    description: "Returns a set of sibling members from the same level as a given member, starting with the first sibling and ending with the given member, as constrained by the Year level in the Time dimension.",
    doc_link: "https://msdn.microsoft.com/en-us/library/ms144753.aspx"
   }, {
    name: "OpeningPeriod",
    example: "OpeningPeriod( [ Level_Expression [ , Member_Expression ] ] )",
    description: "Returns the first sibling among the descendants of a specified level, optionally at a specified member.",
    doc_link: "https://msdn.microsoft.com/en-us/library/ms145992.aspx"
   }, {
    name: "ParallelPeriod",
    example: "ParallelPeriod( [ Level_Expression [ ,Index [ , Member_Expression ] ] ] )",
    description: "Returns a member from a prior period in the same relative position as a specified member.",
    doc_link: "https://msdn.microsoft.com/en-us/library/ms145500.aspx"
   }, {
    name: "Parent",
    example: "Member_Expression.Parent",
    description: "Returns the parent of a member.",
    doc_link: "https://msdn.microsoft.com/en-us/library/ms145513.aspx"
   }, {
    name: "PrevMember",
    example: "Member_Expression.PrevMember",
    description: "Returns the previous member in the level that contains a specified member.",
    doc_link: "https://msdn.microsoft.com/en-us/library/ms144719.aspx"
   }, {
    name: "QTD",
    example: "Qtd( [ Member_Expression ] )",
    description: "Returns a set of sibling members from the same level as a given member, starting with the first sibling and ending with the given member, as constrained by the Quarter level in the Time dimension.",
    doc_link: "https://msdn.microsoft.com/en-us/library/ms145978.aspx"
   }, {
    name: "Sum",
    example: "Sum( Set_Expression [ , Numeric_Expression ] )",
    description: "Returns the sum of a numeric expression evaluated over a specified set.",
    doc_link: "https://msdn.microsoft.com/en-us/library/ms145484.aspx"
   }, {
    name: "WTD",
    example: "Wtd( [ Member_Expression ] )",
    description: "Returns a set of sibling members from the same level as a given member, starting with the first sibling and ending with the given member, as constrained by the Week level in the Time dimension.",
    doc_link: "https://msdn.microsoft.com/en-us/library/ms144930.aspx"
   }, {
    name: "YTD",
    example: "Ytd( [ Member_Expression ] )",
    description: "Returns a set of sibling members from the same level as a given member, starting with the first sibling and ending with the given member, as constrained by the Year level in the Time dimension.",
    doc_link: "https://msdn.microsoft.com/en-us/library/ms146039.aspx"
   }];
   for (var b = "", c = 0; c < a.length; c++) b += '\x3coption title\x3d"' + a[c].description + '" data-desc\x3d"' + a[c].description + '" data-doc-link\x3d"' + a[c].doc_link + '" value\x3d"' + a[c].example +
    '"\x3e' + a[c].name + "\x3c/option\x3e";
   $(".cms-functionlist").append(b)
  },
  change_function_list: function(a) {
   a.preventDefault();
   a = this.$el.find(".cms-functionlist option:selected");
   $(".cms-functionlist").prop("title", $(a).prop("title"));
   $(a).data("doc-link") ? ($(".cms-doclink").prop("href", $(a).data("doc-link")), $(".cms-doclink").show()) : $(".cms-doclink").hide();
   if ($(a).val()) {
    var b = this.$el.find(".formula-editor").attr("id");
    ace.edit(b).insert($(a).val())
   }
  },
  open_select_member_selector: function(a) {
   a.preventDefault();
   var b = this.$el.find("#cms-dimension option:selected").val(),
    c = this.$el.find("#cms-dimension option:selected").text(),
    d = this.$el.find("#cms-dimension option:selected").data("dimension"),
    e = this.$el.find("#cms-dimension option:selected").data("type"),
    f = this.$el.find(".formula-editor").attr("id"),
    g = ace.edit(f),
    h = this;
   $(a.currentTarget).hasClass("btn-select-member") ? ((new ParentMemberSelectorModal({
    dialog: this,
    workspace: this.workspace,
    cube: this.workspace.selected_cube,
    dimensions: Saiku.session.sessionworkspace.cube[this.workspace.selected_cube].get("data").dimensions,
    selectDimension: b,
    dimension: d,
    hierarchy: c,
    uniqueName: this.pmUniqueName,
    lastLevel: this.pmLevel,
    breadcrumbs: this.pmBreadcrumbs,
    select_type: "select_member",
    selected_member: this.selected_member,
    close_callback: function(a) {
     h.close_select_modal(g, a)
    }
   })).render().open(), this.$el.parents(".ui-dialog").find(".ui-dialog-title").text("Connection Details")) : "calcmember" === e && ((new ParentMemberSelectorModal({
    dialog: this,
    workspace: this.workspace,
    cube: this.workspace.selected_cube,
    dimensions: Saiku.session.sessionworkspace.cube[this.workspace.selected_cube].get("data").dimensions,
    selectDimension: b,
    dimension: d,
    hierarchy: c,
    uniqueName: this.pmUniqueName,
    lastLevel: this.lastLevel,
    current_level: this.pmLevel,
    breadcrumbs: this.pmBreadcrumbs
   })).render().open(), this.$el.parents(".ui-dialog").find(".ui-dialog-title").text("Connection Details"))
  },
  close_select_modal: function(a, b) {
   a.insert(b)
  },
  help: function() {
   window.open("http://wiki.meteorite.bi/display/SAIK/Calculated+Members")
  }
 }),
 GrowthModal = Modal.extend({
  type: "filter",
  closeText: "Save",
  measureExpression: "",
  selectedMeasure: "",
  selectedDimension: "",
  asPercent: !1,
  asPercentAround100: !1,
  asPercentAlternative: !1,
  events: {
   "click .dialog_footer a": "call",
   "submit form": "save",
   "change #Measures": "addMeasureToCalculationField",
   "change #Dimensions": "addDimensionToCalculationField",
   'click [type\x3d"checkbox"]': "setAbsoluteOrRelative"
  },
  buttons: [{
   text: "OK",
   method: "save"
  }, {
   text: "Cancel",
   method: "close"
  }],
  addMeasureTemplate: _.template("\x3cspan\x3e Calculate difference of a measure over dimension members \x3c/span\x3e\x3cform id\x3d'measureGrowthForm'\x3e\x3ctable border\x3d'0px'\x3e\x3ctr\x3e\x3ctd class\x3d'col0 i18n'\x3eName:\x3c/td\x3e\x3ctd class\x3d'col1'\x3e\x3cinput type\x3d'text' class\x3d'form-control measure_name' value\x3d'Measure Name'\x3e\x3c/input\x3e\x3c/td\x3e\x3c/tr\x3e\x3cinput type\x3d\"checkbox\" name\x3d\"asPercent\" value\x3d\"asPercent\" id\x3d\"asPercentCheckbox\"\x3e Relative %? \x3cbr\x3e\x3c% if(dimensions.length\x3c2){ %\x3e\x3cinput type\x3d\"checkbox\" name\x3d\"asPercentAlt\" disabled value\x3d\"asPercentAlt\" id\x3d\"asPercentAltCheckbox\"\x3e % of Measure\x3cbr\x3e\x3c% }  else {%\x3e\x3cinput type\x3d\"checkbox\" name\x3d\"asPercentAlt\" value\x3d\"asPercentAlt\" id\x3d\"asPercentAltCheckbox\"\x3e % of Measure\x3cbr\x3e\x3c% }%\x3e\x3cinput type\x3d\"checkbox\" name\x3d\"asPercentAround100\" value\x3d\"asPercentAround100\" id\x3d\"asPercentAround100Checkbox\"\x3e Relative around 100%? \x3cbr\x3e\x3ctr\x3e\x3ctd class\x3d'col0 i18n'\x3eMeasure:\x3c/td\x3e\x3ctd class\x3d'col1'\x3e\x3cselect id\x3d'Measures' class\x3d'form-control' name\x3d'MeasuresId' title\x3d'Select the measure from which the difference should be calculated'\x3e     \x3coption value\x3d'' selected\x3d'selected'\x3e--select an existing measure--\x3c/option\x3e     \x3c% _(measures).each(function(m) { %\x3e       \x3coption value\x3d'\x3c%\x3d m.uniqueName %\x3e'\x3e\x3c%\x3d m.name %\x3e\x3c/option\x3e     \x3c% }); %\x3e \x3c/select\x3e \x3c/td\x3e\x3c/tr\x3e\x3ctr\x3e\x3ctd class\x3d'col0 i18n'\x3eDimension:\x3c/td\x3e\x3ctd class\x3d'col1'\x3e\x3cselect id\x3d'Dimensions' name\x3d'DimensionsId' class\x3d'form-control' title\x3d'This dimension attribute is used to calculate the difference of the selected measure. E.g. Calculate the growth over the years.'\x3e     \x3coption value\x3d'' selected\x3d'selected'\x3e--select a dimension from your query--\x3c/option\x3e     \x3c% _(dimensions).each(function(dim) { %\x3e       \x3coption value\x3d'\x3c%\x3d dim %\x3e'\x3e\x3c%\x3d dim %\x3e\x3c/option\x3e     \x3c% }); %\x3e \x3c/select\x3e \x3c/td\x3e\x3c/tr\x3e\x3ctr\x3e\x3ctd class\x3d'col0 i18n'\x3eFormat:\x3c/td\x3e\x3ctd class\x3d'col1'\x3e\x3cinput class\x3d'measure_format' type\x3d'text' class\x3d'form-control' value\x3d'#,##0.00'\x3e\x3c/input\x3e\x3c/td\x3e\x3c/tr\x3e\x3ctr\x3e\x3ctd class\x3d'col0 i18n'\x3eFormula:\x3c/td\x3e\x3ctd class\x3d'col1'\x3e\x3ctextarea class\x3d'measureFormula auto-hint' class\x3d'form-control' placeholder\x3d'This field will automatically be constructed by selecting a measure and growth dimension from the dropdown lists above...'\x3e\x3c/textarea\x3e\x3c/td\x3e\x3c/tr\x3e\x3c/table\x3e\x3c/form\x3e"),
  initialize: function(a) {
   this.measures = a.measures;
   this.dimensions = a.dimensions;
   this.workspace = a.workspace;
   _.bindAll(this, "save", "addMeasureToCalculationField", "addDimensionToCalculationField", "updateCalculatedMemberField", "setAbsoluteOrRelative", "updateFormatField");
   if (isIE && 9 > isIE) $(this.el).find("form").on("submit", this.save);
   this.message = this.addMeasureTemplate({
    measures: this.measures,
    dimensions: this.dimensions,
    measureExpression: this.measureExpression
   });
   this.$el.find(".dialog_icon")
  },
  save: function(a) {
   a.preventDefault();
   var b = this,
    c = $(this.el).find(".measure_name").val(),
    d = $(this.el).find(".measureFormula").val();
   a = $(this.el).find(".measure_format").val();
   var e = "";
   "undefined" != typeof c && c || (e += "You have to enter a name for the measure! ");
   "undefined" != typeof d && d && "" !== d || (e += "You have to enter a MDX formula for the calculated measure! ");
   "" !== e ? alert(e) : (this.asPercentAlternative ? (_.each(this.memberExpression, function(a) {
    b.workspace.query.helper.addCalculatedMember({
     name: a.name,
     dimension: a.dimension,
     uniqueName: a.uniqueName,
     caption: "*TOTAL_MEMBER_SEL~SUM",
     properties: {},
     formula: a.statement,
     hierarchyName: a.hierarchy,
     parentMember: "",
     parentMemberLevel: "",
     previousLevel: "",
     parentMemberBreadcrumbs: []
    })
   }), c = {
    name: c,
    formula: d,
    properties: {},
    uniqueName: "[Measures]." + c
   }, a && (c.properties.FORMAT_STRING = "###0.00%")) : (c = {
    name: c,
    formula: d,
    properties: {},
    uniqueName: "[Measures]." + c
   }, a && (c.properties.FORMAT_STRING = a)), b.workspace.query.helper.addCalculatedMeasure(c), b.workspace.sync_query(), this.close());
   return !1
  },
  endswith: function(a, b) {
   return -1 !==
    a.indexOf(b, a.length - b.length)
  },
  updateCalculatedMemberField: function() {
   var a = "[Measures]." + this.surroundWithSquareBrackets(this.selectedMeasure),
    b = this.selectedDimension + ".CurrentMember.PrevMember";
   if (this.asPercent) this.measureExpression = "( IIF( IsEmpty(" + b + "),NULL, ( " + a + " - (" + a + ", " + b + ")) / ( " + a + ", " + b + ")))";
   else if (this.asPercentAround100) this.measureExpression = "( IIF( IsEmpty(" + b + "),NULL, 1 + ( " + a + " - (" + a + ", " + b + ")) / ( " + a + ", " + b + ")))";
   else if (this.asPercentAlternative) {
    b = this.workspace.query.helper.getAxis("ROWS").hierarchies;
    this.memberExpression = [];
    for (var c = $(this.el).find("#Dimensions").val(), d = !1, e = this.calculate_nonempty_crossjoin(b), f = 0; f < b.length; f++) {
     var g = b[f];
     if (c === g.name) d = !0;
     else if (1 == d) {
      var h = this.calculated_generate(e, g),
       k = g.name,
       g = g.dimension;
      this.memberExpression.push({
       dimension: g,
       hierarchy: k,
       statement: "sum(" + h + ")",
       uniqueName: k + ".[" + g + "*TOTAL_MEMBER_SEL~SUM]",
       name: g + "*TOTAL_MEMBER_SEL~SUM"
      })
     }
    }
    var l = "";
    _.each(this.memberExpression, function(a) {
     l += "," + a.uniqueName
    });
    this.measureExpression = a + "/(" + a + l + ")"
   } else this.measureExpression =
    "( IIF( IsEmpty(" + b + "),NULL, ( " + a + " - ( " + a + ", " + b + "))))";
   $(".measureFormula").val(this.measureExpression)
  },
  addMeasureToCalculationField: function(a) {
   this.selectedMeasure = this.$("#Measures option:selected").text();
   this.updateCalculatedMemberField()
  },
  addDimensionToCalculationField: function(a) {
   this.selectedDimension = this.$("#Dimensions option:selected").text();
   this.updateCalculatedMemberField()
  },
  setAbsoluteOrRelative: function(a) {
   a = a.target.id;
   var b = this;
   "asPercentCheckbox" == a ? (this.asPercent = !this.asPercent,
    this.asPercentAlternative = this.asPercentAround100 = !1, $(this.el).find("#Dimensions option").remove(), _.each(this.dimensions, function(a) {
     $(b.el).find("#Dimensions").append($("\x3coption\x3e\x3c/option\x3e").attr("value", a).text(a))
    }), $(this.el).find("#Dimensions").find("option:last").prop("disabled", !1)) : "asPercentAround100Checkbox" == a ? (this.asPercentAround100 = !this.asPercentAround100, this.asPercentAlternative = this.asPercent = !1, $(this.el).find("#Dimensions option").remove(), _.each(this.dimensions, function(a) {
    $(b.el).find("#Dimensions").append($("\x3coption\x3e\x3c/option\x3e").attr("value",
     a).text(a))
   }), $(this.el).find("#Dimensions").find("option:last").prop("disabled", !1)) : "asPercentAltCheckbox" == a && (this.asPercentAlternative = !this.asPercentAlternative, this.asPercentAround100 = this.asPercent = !1, $(this.el).find("#Dimensions option").remove(), a = this.workspace.query.helper.getAxis("ROWS").hierarchies, _.each(a, function(a) {
    $(b.el).find("#Dimensions").append($("\x3coption\x3e\x3c/option\x3e").attr("value", a.name).text(a.name))
   }), $(this.el).find("#Dimensions").find("option:last").prop("disabled", !0));
   $("#asPercentCheckbox").prop("checked", this.asPercent);
   $("#asPercentAround100Checkbox").prop("checked", this.asPercentAround100);
   $("#asPercentAltCheckbox").prop("checked", this.asPercentAlternative);
   this.updateCalculatedMemberField();
   this.updateFormatField()
  },
  updateFormatField: function(a) {
   (this.asPercent || this.asPercentAround100) && $(".measure_format").val("0.00%")
  },
  surroundWithSquareBrackets: function(a) {
   return "[" + a + "]"
  },
  calculate_nonempty_crossjoin: function(a) {
   var b;
   b = this.return_selected_members(a[a.length -
    1]);
   b = "NONEMPTYCROSSJOIN(" + this.return_selected_members(a[a.length - 2]) + "," + b + ")";
   if (2 < a.length)
    for (var c = a.length - 2; 0 < c; --c) b = "NONEMPTYCROSSJOIN(" + this.return_selected_members(a[c - 1]) + "," + b + ")";
   return b
  },
  calculated_generate: function(a, b) {
   return "Generate(" + a + ",{" + b.name + ".CURRENTMEMBER})"
  },
  return_selected_members: function(a) {
   var b = "",
    c;
   _.each(a.levels, function(a) {
    c = a
   });
   if (0 < c.selection.members.length) return _.each(c.selection.members, function(a) {
     b += a.uniqueName + ","
    }), "{" + b.substring(0, b.length - 1) +
    "}";
   var d = a.levels,
    d = Object.keys(d)[Object.keys(d).length - 1];
   return a.name + ".[" + d + "].MEMBERS"
  }
 }),
 FormatAsPercentageModal = Modal.extend({
  type: "filter",
  closeText: "Save",
  generatedMeasures: [],
  selectedMeasure: "",
  selectedDimension: "",
  asPercent: !0,
  events: {
   "click .dialog_footer a": "call",
   "click .formatButton": "format"
  },
  buttons: [{
   text: "Cancel",
   method: "close"
  }, {
   text: "Help",
   method: "help"
  }],
  addMeasureTemplate: _.template("\x3cdiv class\x3d'text'\x3eName: \x3cinput type\x3d'text' class\x3d'measure_name form-control'\x3e\x3c/input\x3e \x3c/div\x3e \x3cdiv\x3e \x3cspan\x3e Select how to express the measures: \x3c/span\x3e \x3c/div\x3e\x3col style\x3d'list-style-type: none;'\x3e \x3cli style\x3d'padding-bottom: 10px; padding-right: 10px; float: inherit;'\x3e         \x3cbutton class\x3d'form_button btn btn-primary formatButton' id\x3d'formatOverRows'\x3e Format as % of rows \x3c/button\x3e\x3c/li\x3e\x3cli style\x3d'padding-bottom: 10px; padding-right: 10px; float: inherit;'\x3e         \x3cbutton class\x3d'form_button btn btn-primary formatButton' id\x3d'formatOverColumns'\x3e Format as % of columns \x3c/button\x3e\x3c/li\x3e\x3cli style\x3d'padding-bottom: 10px; padding-right: 10px; float: inherit;'\x3e         \x3cbutton class\x3d'form_button formatButton btn btn-primary' id\x3d'formatOverTotal'\x3e Format as % of total \x3c/button\x3e\x3c/li\x3e\x3c/ol\x3e\x3cspan id\x3d'userFeedback'\x3e \x3cp\x3e \x3c%\x3d userFeedback %\x3e \x3c/p\x3e \x3c/span\x3e"),
  userFeedback: "",
  selectedRows: [],
  selectedColumns: [],
  initialize: function(a) {
   this.measures = a.measures;
   this.workspace = a.workspace;
   a = this.workspace.query.model.mdx;
   this.selectedRows = this.extractFromMdx(a, "~ROWS");
   this.selectedColumns = this.extractFromMdx(a, "~COLUMNS");
   this.generatedMeasures = [];
   _.bindAll(this, "save", "format");
   this.options.title = "Format as percentage";
   if (isIE && 9 > isIE) $(this.el).find("form").on("submit", this.save);
   this.userFeedback = this.checkRowsOrColumnsPresent(this.selectedColumns, this.selectedRows);
   this.message = this.addMeasureTemplate({
    userFeedback: this.userFeedback
   });
   this.$el.find(".dialog_icon")
  },
  save: function(a, b, c) {
   var d = $(this.el).find(".measure_name").val();
   if (null == d || "" == d) d = b + " % of " + c;
   b = "";
   "undefined" != typeof d && d || (b += "You have to enter a name for the measure! ");
   "undefined" != typeof a && a && "" !== a || (b += "You have to enter a MDX formula for the calculated measure! ");
   "" !== b ? alert(b) : (a = {
     name: d,
     formula: a,
     properties: {},
     uniqueName: "[Measures]." + d
    }, a.properties.FORMAT_STRING = "0.00%", this.workspace.query.helper.addCalculatedMeasure(a),
    this.generatedMeasures.push(a))
  },
  format: function(a) {
   a.preventDefault();
   a = a.target.id;
   for (var b = this.determineFormatOver(a), c = 0; c < this.measures.length; c++) {
    var d = this.measures[c].uniqueName;
    try {
     var e = this.formatMeasure(d, a);
     this.save(e, this.measures[c].caption, b)
    } catch (f) {
     this.setUserFeedback(f)
    }
   }
   this.replaceMeasuresWithFormattedMeasures();
   this.workspace.sync_query();
   this.workspace.toolbar.run_query();
   this.generatedMeasures = [];
   this.close()
  },
  formatMeasure: function(a, b) {
   var c = "";
   if ("formatOverRows" ==
    b) {
    if (0 == this.selectedColumns.length) throw "There are no dimensions in the columns to format over";
    c = this.makeCrossJoinExpression(this.selectedColumns);
    c = a + " / SUM(CROSSJOIN(" + c + "," + a + "))"
   } else if ("formatOverColumns" == b) {
    if (0 == this.selectedRows.length) throw "There are no dimensions in the rows to format over";
    c = this.makeCrossJoinExpression(this.selectedRows);
    c = a + " / SUM(CROSSJOIN(" + c + "," + a + "))"
   } else if ("formatOverTotal" == b) {
    if (0 == this.selectedRows.length && 0 == this.selectedColumns.length) throw "There are no dimensions in the rows and columns to format over";
    c = this.makeCrossJoinExpression(this.selectedRows.concat(this.selectedColumns));
    c = a + " / SUM(CROSSJOIN(" + c + "," + a + "))"
   }
   return c
  },
  replaceMeasuresWithFormattedMeasures: function() {
   var a = this.workspace.query.helper;
   a.clearMeasures();
   for (var b = this.generatedMeasures, c = [], d = 0; d < b.length; d++) c[d] = {
    name: b[d].name,
    type: "CALCULATED"
   };
   a.setMeasures(c)
  },
  extractFromMdx: function(a, b) {
   var c = [];
   if (null == a || "" == a) c = [];
   else
    for (var d = a.substring(0, a.indexOf("SELECT") - 1), e = this.occurrences(d, b, !1), f = 0, g = 0; g < e; g++) {
     var f =
      d.indexOf(b, f),
      h = d.indexOf("]", f),
      h = d.substring(f, h);
     c[g] = "[" + h + "]";
     f += 1
    }
   return c
  },
  occurrences: function(a, b, c) {
   a += "";
   b += "";
   if (0 >= b.length) return a.length + 1;
   var d = 0,
    e = 0;
   for (c = c ? 1 : b.length;;)
    if (e = a.indexOf(b, e), 0 <= e) d++, e += c;
    else break;
   return d
  },
  makeCrossJoinExpression: function(a) {
   for (var b = a[0], c = 1; c < a.length; c++) b += " * ", b += a[c];
   return b
  },
  determineFormatOver: function(a) {
   var b = "";
   return b = -1 != a.indexOf("Rows") ? "rows" : -1 != a.indexOf("Columns") ? "columns" : "total"
  },
  setUserFeedback: function(a) {
   $("#userFeedback").html("\x3cp class\x3d'editor_info'\x3e" +
    a + "\x3c/p\x3e")
  },
  checkRowsOrColumnsPresent: function(a, b) {
   return null != a && void 0 != a && 0 != a.length || null != b && void 0 != b && 0 != b.length ? "" : "You selected no columns or rows, you should probably return."
  },
  help: function() {
   window.location("http://wiki.meteorite.bi/display/SAIK/Totals+and+Subtotals")
  }
 }),
 ParentMemberSelectorModal = Modal.extend({
  selected_member: null,
  close_callback: null,
  select_type: "parent-member-selector",
  type: "parent-member-selector",
  template_modal: _.template('\x3cform class\x3d"form-group" onsubmit\x3d"return false;"\x3e\x3cdiv class\x3d"group-elements" style\x3d"padding-top: 0;"\x3e\x3cnav class\x3d"breadcrumbs"\x3e\x3c/nav\x3e\x3cspan class\x3d"loading i18n"\x3eLoading...\x3c/span\x3e\x3c/div\x3e\x3c% if (Settings.PARENT_MEMBER_DIMENSION||this.select_type!\x3d\x3d"parent-member-selector") { %\x3e\x3cdiv class\x3d"group-elements"\x3e\x3clabel for\x3d"dimension" class\x3d"i18n"\x3eDimension:\x3c/label\x3e\x3cselect id\x3d"dimension" class\x3d"form-control"\x3e\x3coptgroup label\x3d"Measures"\x3e\x3coption value\x3d"[Measures].[Measures]" data-dimension\x3d"Measures" data-type\x3d"calcmember"\x3eMeasures\x3c/option\x3e\x3c/optgroup\x3e\x3c% _(dimensions).each(function(dimension) { %\x3e\x3coptgroup label\x3d"\x3c%\x3d dimension.name %\x3e"\x3e\x3c% _(dimension.hierarchies).each(function(hierarchy) { %\x3e\x3coption value\x3d"\x3c%\x3d hierarchy.uniqueName %\x3e" data-dimension\x3d"\x3c%\x3d dimension.name %\x3e" data-type\x3d"calcmember"\x3e\x3c%\x3d hierarchy.name %\x3e\x3c/option\x3e\x3c% }); %\x3e\x3c/optgroup\x3e\x3c% }); %\x3e\x3c/select\x3e\x3c/div\x3e\x3c% } %\x3e\x3cdiv class\x3d"group-elements"\x3e\x3clabel\x3e\x3cspan class\x3d"i18n"\x3eSelected Level:\x3c/span\x3e \x3cspan class\x3d"selected-level"\x3e\x3c/span\x3e\x3c/label\x3e\x3c/div\x3e\x3cdiv class\x3d"group-elements"\x3e\x3cul class\x3d"members-list"\x3e\x3cli class\x3d"i18n"\x3eLoading...\x3c/li\x3e\x3cul\x3e\x3c/div\x3e\x3cdiv class\x3d"group-elements"\x3e\x3cinput type\x3d"search" class\x3d"form-control" id\x3d"auto-filter" results\x3d"5" placeholder\x3d"Autocomplete Filter"\x3e\x3c/div\x3e\x3c/form\x3e'),
  buttons: [{
   text: "Add",
   method: "save"
  }, {
   text: "Clear",
   method: "clear"
  }, {
   text: "Cancel",
   method: "close"
  }],
  events: {
   "click    .dialog_footer a": "call",
   "click    .crumb": "fetch_crumb",
   "change   #dimension": "fetch_dimension",
   "click    .drill_member": "drill_member",
   "keyup    #auto-filter": "auto_filter",
   "click    .member": "select_member"
  },
  initialize: function(a) {
   _.extend(this, a);
   this.workspace = a.workspace;
   this.options.title = "Member Selector";
   void 0 !== a.select_type && (this.select_type = a.select_type);
   this.current_level =
    a.current_level;
   this.lastLevel = a.lastLevel;
   this.selected_member = a.selected_member;
   this.close_callback = a.close_callback;
   a = Saiku.session.sessionworkspace.cube[this.cube].get("data").dimensions;
   this.message = this.template_modal({
    dimensions: a
   });
   this.bind("open", function() {
    this.$el.find("#dimension").val(this.selectDimension);
    _.isEmpty(this.uniqueName) && _.isEmpty(this.breadcrumbs) && !_.isEmpty(this.dimension) ? (Saiku.ui.block('\x3cspan class\x3d"i18n"\x3eLoading...\x3c/span\x3e'), this.new_parent_member()) :
     _.isEmpty(this.dimension) || (Saiku.ui.block('\x3cspan class\x3d"i18n"\x3eLoading...\x3c/span\x3e'), this.edit_parent_member())
   })
  },
  new_parent_member: function() {
   if ("Measures" != this.dimension)(new Level({}, {
    ui: this,
    cube: this.cube,
    dimension: this.dimension,
    hierarchy: this.hierarchy
   })).fetch({
    success: this.get_levels
   });
   else {
    var a = Saiku.session.sessionworkspace.cube[this.cube].get("data").measures;
    this.populate_members_list(a)
   }
  },
  edit_parent_member: function() {
   if (void 0 != this.lastLevel && "" != this.lastLevel) {
    var a =
     this;
    (new LevelMember({}, {
     ui: this,
     cube: this.cube,
     dimension: this.dimension,
     hierarchy: this.hierarchy,
     level: this.lastLevel
    })).fetch({
     success: function(b, c) {
      a.get_members(b, c);
      a.populate_breadcrumbs(a.breadcrumbs)
     }
    })
   } else this.new_parent_member()
  },
  populate_breadcrumbs: function(a) {
   for (var b = [], c = a.length, d = 0; d < c; d++) d !== a.length - 1 ? 0 === d || 1 === d ? b.push('\x3ca href\x3d"#fetch_crumb" class\x3d"crumb" data-position\x3d"' + d + '" data-action\x3d"false"\x3e' + a[d] + "\x3c/a\x3e \x26gt;") : b.push('\x3ca href\x3d"#fetch_crumb" class\x3d"crumb" data-position\x3d"' +
    d + '" data-action\x3d"true"\x3e' + a[d] + "\x3c/a\x3e \x26gt;") : b.push('\x3cspan class\x3d"last-crumb"\x3e' + a[d] + "\x3c/span\x3e");
   Saiku.ui.unblock();
   this.$el.find(".loading").remove();
   this.$el.find(".breadcrumbs").empty();
   this.$el.find(".breadcrumbs").append(b)
  },
  populate_members_list: function(a) {
   var b = [],
    c = a.length;
   this.$el.find(".members-list").empty();
   for (var d = 0; d < c; d++) new LevelChildMember({}, {
     ui: this,
     cube: this.cube,
     uniqueName: a[d].uniqueName,
     levelUniqueName: a[d].levelunique,
     mname: a[d].name,
     mcaption: a[d].caption
    }),
    b = $("\x3cli /\x3e").addClass("member").data("caption", a[d].caption).data("uniqueName", a[d].uniqueName).data("levelUniqueName", a[d].levelUniqueName ? a[d].levelUniqueName : !1).data("currentLevelUnique", a[d].levelUniqueName).html(a[d].name + "\x3cspan class\x3d'drill_member' style\x3d'float:right;'\x3eNext Level\x3c/span\x3e"), this.$el.find(".members-list").append(b);
   Saiku.ui.unblock()
  },
  get_levels: function(a, b) {
   var c;
   b ? (a.ui.breadcrumbs = [a.ui.dimension, a.ui.hierarchy, b[0].name], a.ui.get_last_level(), a.ui.populate_breadcrumbs(a.ui.breadcrumbs),
    a.ui.$el.find(".dialog_footer").find('a[href\x3d"#clear"]').data("name", b[0].name), c = new LevelMember({}, {
     ui: a.ui,
     cube: a.ui.cube,
     dimension: a.ui.dimension,
     hierarchy: a.ui.hierarchy,
     level: b[0].name
    }), c.fetch({
     success: a.ui.get_members
    })) : Saiku.ui.unblock()
  },
  get_members: function(a, b) {
   b ? a.ui.populate_members_list(b) : Saiku.ui.unblock()
  },
  get_child_members: function(a, b) {
   var c;
   b && 0 < b.length ? (a.ui.populate_members_list(b), c = b[0].levelUniqueName.split("].["), c = _.last(c).replace(/[\[\]]/gi, ""), a.ui.breadcrumbs.push(c),
    a.ui.breadcrumbs = _.uniq(a.ui.breadcrumbs), c = _.indexOf(a.ui.breadcrumbs, c), a.ui.breadcrumbs = _.initial(a.ui.breadcrumbs, a.ui.breadcrumbs.length - (c + 1)), a.ui.get_last_level(), a.ui.populate_breadcrumbs(a.ui.breadcrumbs)) : Saiku.ui.unblock()
  },
  return_actual_level: function(a, b) {
   b && 0 < b.length ? a.ui.actualLevel = b[0].levelUniqueName : Saiku.ui.unblock()
  },
  drill_member: function(a) {
   a.preventDefault();
   Saiku.ui.block('\x3cspan class\x3d"i18n"\x3eLoading...\x3c/span\x3e');
   a = $(a.currentTarget).closest(".member").data("uniqueName");
   this.$el.find("#auto-filter").val("");
   (new LevelChildMember({}, {
    ui: this,
    cube: this.cube,
    uniqueName: a
   })).fetch({
    success: this.get_child_members
   })
  },
  get_actual_level: function(a) {
   Saiku.ui.block('\x3cspan class\x3d"i18n"\x3eLoading...\x3c/span\x3e');
   (new LevelChildMember({}, {
    ui: this,
    cube: this.cube,
    uniqueName: a
   })).fetch({
    success: this.return_actual_level
   })
  },
  auto_filter: function(a) {
   if (13 === a.keyCode) return !1;
   a = $(a.currentTarget).val();
   var b = new LevelChildMember({}, {
    ui: this,
    cube: this.cube,
    uniqueName: a
   });
   a &&
    !_.isEmpty(a) && b.fetch({
     success: this.get_child_members
    })
  },
  fetch_crumb: function(a) {
   a.preventDefault();
   a = $(a.currentTarget);
   a.data("action") && ((new LevelMember({}, {
    ui: this,
    cube: this.cube,
    dimension: this.dimension,
    hierarchy: this.hierarchy,
    level: a.text()
   })).fetch({
    success: this.get_members
   }), this.reset_form(), this.breadcrumbs = _.initial(this.breadcrumbs, this.breadcrumbs.length - (Number(a.data("position")) + 1)), this.populate_breadcrumbs(this.breadcrumbs))
  },
  fetch_dimension: function(a) {
   a.preventDefault();
   Saiku.ui.block('\x3cspan class\x3d"i18n"\x3eLoading...\x3c/span\x3e');
   this.$el.find("#dimension option:selected").val();
   a = this.$el.find("#dimension option:selected").text();
   var b = this.$el.find("#dimension option:selected").data("dimension");
   this.reset_form();
   this.dimension = b;
   this.hierarchy = a;
   this.new_parent_member()
  },
  selected_level: function() {
   var a;
   a = this.breadcrumbs[this.breadcrumbs.length - 1];
   this.$el.find(".selected-level").text(a)
  },
  get_last_level: function() {
   this.lastLevel = _.last(this.breadcrumbs)
  },
  reset_form: function() {
   this.uniqueName = "";
   this.$el.find(".selected-level").text("");
   this.$el.find(".members-list").empty();
   this.$el.find(".members-list").append('\x3cli class\x3d"i18n"\x3eLoading...\x3c/li\x3e');
   this.$el.find("#auto-filter").val("")
  },
  clear: function(a) {
   a.preventDefault();
   a = $(this.el).find(".dialog_footer").find('a[href\x3d"#clear"]').data("name");
   (new LevelMember({}, {
    ui: this,
    cube: this.cube,
    dimension: this.dimension,
    hierarchy: this.hierarchy,
    level: a
   })).fetch({
    success: this.get_members
   });
   this.reset_form();
   a = _.indexOf(this.breadcrumbs, a);
   this.breadcrumbs = _.initial(this.breadcrumbs,
    this.breadcrumbs.length - (a + 1));
   this.populate_breadcrumbs(this.breadcrumbs)
  },
  save: function(a) {
   a.preventDefault();
   a = "";
   if ("undefined" === typeof this.uniqueName || _.isEmpty(this.uniqueName)) a += "You have to choose a member for the calculated member!";
   if ("" !== a) alert(a);
   else {
    if ("parent-member-selector" === this.select_type) {
     a = "[" + this.dimension + "].[" + this.hierarchy + "].";
     var b = void 0 !== this.uniqueName.split(a)[1] ? this.uniqueName.split(a)[1] : this.uniqueName.split(a)[0];
     this.dialog.actualLevel = this.actualLevel;
     Settings.PARENT_MEMBER_DIMENSION && Saiku.session.trigger("ParentMemberSelectorModal:save", {
      dialog: this.dialog,
      selectedDimension: this.$el.find("#dimension option:selected").val()
     });
     this.dialog.pmUniqueName = a + b;
     this.dialog.pmLevel = this.current_level;
     this.dialog.lastLevel = this.lastLevel;
     this.dialog.pmBreadcrumbs = _.uniq(this.breadcrumbs);
     this.dialog.$el.find("#cms-pmember").val(a + b)
    } else "Measures" !== this.dimension ? (a = "[" + this.dimension + "].[" + this.hierarchy + "].", b = void 0 !== this.uniqueName.split(a)[1] ? this.uniqueName.split(a)[1] :
     this.uniqueName.split(a)[0], null != this.close_callback && this.close_callback(a + b)) : this.close_callback(this.uniqueName);
    this.$el.dialog("close")
   }
  },
  select_member: function(a) {
   a.preventDefault();
   a = $(a.currentTarget);
   a.closest("ul").children("li").removeClass("highlight_li");
   a.addClass("highlight_li");
   this.uniqueName = a.data("uniqueName");
   this.get_actual_level(this.uniqueName);
   this.current_level = a.data("currentLevelUnique");
   this.selected_level();
   this.$el.find("#auto-filter").val("")
  }
 }),
 DataSourcesModal =
 Modal.extend({
  type: "data-sources",
  message: '\x3cform class\x3d"form-group-inline"\x3e\x3clabel for\x3d"data-sources"\x3eSelect a data source:\x3c/label\x3e\x3cselect class\x3d"form-control" id\x3d"data-sources"\x3e\x3c/select\x3e\x3c/form\x3e',
  buttons: [{
   text: "Add",
   method: "add"
  }, {
   text: "Cancel",
   method: "close"
  }],
  events: {
   "click .dialog_footer a": "call"
  },
  initialize: function(a) {
   _.extend(this, a);
   this.options.title = "Data Sources";
   (new DataSources({}, {
    dialog: this
   })).fetch();
   this.bind("open")
  },
  option_template: function(a) {
   return _.template('\x3coption value\x3d""\x3e-- Select --\x3c/option\x3e\x3c% _.each(obj, function(value) { %\x3e\x3coption value\x3d"\x3c%\x3d value.name %\x3e"\x3e\x3c%\x3d value.name %\x3e\x3c/option\x3e\x3c% }); %\x3e')(a)
  },
  callback: function(a) {
   var b = this.option_template(a);
   this.dataSources = a;
   this.$el.find("#data-sources").append(b)
  },
  populate_form: function(a) {
   var b = this.dataSources,
    c = b.length,
    d;
   for (d = 0; d < c; d++) b[d].name === a && (this.dialog.$el.find(this.formElements.url).val(b[d].url), this.dialog.$el.find(this.formElements.driver).val(b[d].driver), this.dialog.$el.find(this.formElements.username).val(b[d].username), this.dialog.$el.find(this.formElements.password).val(b[d].password))
  },
  add: function(a) {
   a.preventDefault();
   (a = this.$el.find("#data-sources option:selected").val()) && this.populate_form(a);
   this.$el.dialog("close")
  }
 }),
 QueryToolbar = Backbone.View.extend({
  events: {
   "click .options a.button": "call",
   "click .renderer a.button": "switch_render_button"
  },
  chart: {},
  render_mode: "table",
  spark_mode: null,
  initialize: function(a) {
   this.workspace = a.workspace;
   _.bindAll(this, "call", "activate_buttons", "spark_bar", "spark_line", "render_row_viz", "run_row_viz", "switch_render_button");
   this.render_mode = "table";
   this.spark_mode = null;
   this.workspace.bind("query:new",
    this.activate_buttons);
   this.workspace.bind("query:result", this.activate_buttons);
   this.workspace.bind("table:rendered", this.run_row_viz)
  },
  activate_buttons: function(a) {
   "undefined" != typeof a && null !== a && ($(this.el).find("a").removeClass("disabled_toolbar"), a.data || $(this.el).find("a.export_button, a.stats").addClass("disabled_toolbar"), isIE && $(this.el).find("a.export_button").addClass("disabled_toolbar"))
  },
  template: function() {
   var a = $("#template-query-toolbar").html() || "";
   return _.template(a)()
  },
  render: function() {
   $(this.el).html(this.template());
   $(this.el).find("render_table").addClass("on");
   $(this.el).find("ul.table").show();
   return this
  },
  switch_render_button: function(a) {
   var b = $(a.target);
   a.preventDefault();
   if ($(a.target).hasClass("disabled_toolbar")) return !1;
   b.parent().siblings().find(".on").removeClass("on");
   a = 0 < $(this.el).find("ul.chart li a.on:first").size() ? $(this.el).find("ul.chart li a.on:first").attr("href").replace("#", "") : null;
   b.hasClass("render_chart") ? (Saiku.events.trigger("queryToolbar:render_chart", this, null), "map" === a ? (b = (b =
    this.workspace.query.getProperty("saiku.ui.map.options")) ? b.mapDefinition.type : "", this.switch_render("map"), this.workspace.query.setProperty("saiku.ui.render.mode", "map"), this.workspace.query.setProperty("saiku.ui.render.type", b)) : (this.switch_render("chart"), this.workspace.query.setProperty("saiku.ui.render.mode", "chart"), b = 0 < $(this.el).find("ul.chart li a.on:first").size() ? $(this.el).find("ul.chart li a.on:first").attr("href").replace("#", "") : null, null !== b && ("charteditor" === b && (b = $(this.el).find("ul.chart li").not(".chart_editor").find("a.on").attr("href").replace("#",
    "")), this.workspace.query.setProperty("saiku.ui.render.type", b)))) : (this.switch_render("table"), this.workspace.query.setProperty("saiku.ui.render.mode", "table"), this.workspace.query.setProperty("saiku.ui.render.type", this.spark_mode))
  },
  switch_render: function(a) {
   a = "undefined" != typeof a ? a.toLowerCase() : "table";
   $(this.el).find("ul.renderer a.on").removeClass("on");
   $(this.el).find("ul.renderer a.render_" + a).addClass("on");
   "chart" == a ? ($(this.el).find("ul.chart").show(), $(this.el).find("ul.table").hide(),
     this.render_mode = "chart", $(this.workspace.el).find(".workspace_results").children().hide(), $(this.workspace.chart.el).find(".canvas_wrapper").hide(), this.workspace.chart.show(), this.workspace.set_class_charteditor()) : "map" === a ? (this.$el.find("ul.renderer a.render_chart").addClass("on"), this.$el.find("ul.chart").show(), this.$el.find("ul.table").hide(), this.render_mode = "map", this.workspace.$el.find(".workspace_results").children().hide(), this.workspace.chart.$el.find(".canvas_wrapper").hide(), this.workspace.chart.show()) :
    ($(this.el).find("ul.chart").hide(), $(this.el).find("ul.table").show(), $(this.el).find("ul.table .stats").removeClass("on"), $(this.workspace.el).find(".workspace_results").children().hide(), $(this.workspace.el).find(".workspace_results .table_wrapper").show(), $(this.workspace.chart.el).hide().children().hide(), this.render_mode = "table", this.workspace.query.result.hasRun() && this.workspace.table.render({
     data: this.workspace.query.result.lastresult()
    }));
   return !1
  },
  call: function(a) {
   var b = $(a.target).hasClass("button") ?
    $(a.target) : $(a.target).parent();
   if (!b.hasClass("disabled_toolbar")) {
    var c = b.attr("href").replace("#", "");
    if ("table" == this.render_mode && this[c]) this[c](a);
    else if ("chart" == this.render_mode) {
     this.workspace.chart.$el.find(".canvas_wrapper").find(".map-render").data("action", "querytoolbar");
     if (b.hasClass("chartoption")) {
      var d = {
       mapDefinition: {}
      };
      this.workspace.query.setProperty("saiku.ui.map.options", d);
      this.workspace.query.setProperty("saiku.ui.render.mode", "chart");
      this.workspace.querytoolbar.$el.find('ul.chart [href\x3d"#export_button"]').parent().removeAttr("disabled");
      this.workspace.querytoolbar.$el.find("ul.chart \x3e li#charteditor").removeAttr("disabled");
      this.workspace.querytoolbar.$el.find('ul.chart [href\x3d"#map"]').removeClass("on");
      b.parent().siblings().find(".chartoption.on").removeClass("on");
      b.addClass("on");
      this.workspace.set_class_charteditor()
     }
     if ("export_button" == c) this.workspace.chart[c](a);
     else this.workspace.chart.renderer.switch_chart(c), this.workspace.query.setProperty("saiku.ui.render.type", c)
    } else if ("map" === this.render_mode && "map" !== c)
     if (this.workspace.chart.$el.find(".canvas_wrapper").find(".map-render").data("action",
       "querytoolbar"), b.hasClass("chartoption") && (d = {
        mapDefinition: {}
       }, this.workspace.query.setProperty("saiku.ui.map.options", d), this.workspace.query.setProperty("saiku.ui.render.mode", "chart"), this.workspace.querytoolbar.$el.find('ul.chart [href\x3d"#export_button"]').parent().removeAttr("disabled"), this.workspace.querytoolbar.$el.find("ul.chart \x3e li#charteditor").removeAttr("disabled"), this.workspace.querytoolbar.$el.find('ul.chart [href\x3d"#map"]').removeClass("on"), b.parent().siblings().find(".chartoption.on").removeClass("on"),
       b.addClass("on")), "export_button" == c) this.workspace.chart[c](a);
     else this.workspace.chart.renderer.switch_chart(c), this.workspace.query.setProperty("saiku.ui.render.type", c)
   }
   a.preventDefault();
   return !1
  },
  spark_bar: function() {
   $(this.el).find("ul.table .spark_bar").toggleClass("on");
   $(this.el).find("ul.table .spark_line").removeClass("on");
   $(this.workspace.table.el).find("td.spark").remove();
   $(this.el).find("ul.table .spark_bar").hasClass("on") ? (this.spark_mode = "spark_bar", this.workspace.query.setProperty("saiku.ui.render.type",
    "spark_bar"), _.delay(this.render_row_viz, 10, "spark_bar")) : this.spark_mode = null
  },
  spark_line: function() {
   $(this.el).find("ul.table .spark_line").toggleClass("on");
   $(this.el).find("ul.table .spark_bar").removeClass("on");
   $(this.workspace.table.el).find("td.spark").remove();
   $(this.el).find("ul.table .spark_line").hasClass("on") ? (this.spark_mode = "spark_line", this.workspace.query.setProperty("saiku.ui.render.type", "spark_line"), _.delay(this.render_row_viz, 10, "spark_line")) : this.spark_mode = null
  },
  run_row_viz: function(a) {
   "table" ==
   this.render_mode && null !== this.spark_mode && this.render_row_viz(this.spark_mode)
  },
  render_row_viz: function(a) {
   $(this.workspace.table.el).find("tr").each(function(b, c) {
    var d = [];
    $(c).find("td.data div").each(function(a, b) {
     var c = $(b).attr("alt"),
      c = "undefined" != typeof c && "" !== c && null !== c && "undefined" != c ? parseFloat(c) : 0;
     d.push(c)
    });
    $("\x3ctd class\x3d'data spark'\x3e\x26nbsp;\x3cdiv id\x3d'chart" + b + "'\x3e\x3c/div\x3e\x3c/td\x3e").appendTo($(c));
    var e = 9 * d.length;
    if (0 < d.length) {
     var f = (new pv.Panel).canvas("chart" +
      b).height(12).width(e).margin(0);
     "spark_bar" == a ? f.add(pv.Bar).data(d).left(pv.Scale.linear(0, d.length).range(0, e).by(pv.index)).height(pv.Scale.linear(0, _.max(d)).range(0, 12)).width(6).bottom(0) : "spark_line" == a && (e /= 2, f.width(e), f.add(pv.Line).data(d).left(pv.Scale.linear(0, d.length - 1).range(0, e).by(pv.index)).bottom(pv.Scale.linear(d).range(0, 12)).strokeStyle("#000").lineWidth(1));
     f.render()
    }
   })
  }
 }),
 WorkspaceToolbar = Backbone.View.extend({
  enabled: !1,
  events: {
   "click a": "call"
  },
  initialize: function(a) {
   this.workspace =
    a.workspace;
   _.bindAll(this, "call", "reflect_properties", "run_query", "swap_axes_on_dropzones", "display_drillthrough", "clicked_cell_drillthrough_export", "clicked_cell_drillacross", "clicked_cell_drillthrough", "activate_buttons", "switch_to_mdx", "post_mdx_transform", "toggle_fields_action", "group_parents");
   this.workspace.bind("workspace:toolbar:render", this.translate);
   this.workspace.bind("properties:loaded", this.reflect_properties);
   this.workspace.trigger("workspace:toolbar:render", {
    workspace: this.workspace
   });
   this.workspace.bind("query:new", this.activate_buttons);
   this.workspace.bind("query:result", this.activate_buttons)
  },
  activate_buttons: function(a) {
   null !== a && a.data && a.data.cellset && 0 < a.data.cellset.length ? ($(a.workspace.toolbar.el).find(".button").removeClass("disabled_toolbar"), $(a.workspace.el).find("td.data").removeClass("cellhighlight").unbind("click"), $(a.workspace.el).find(".table_mode").removeClass("on")) : ($(a.workspace.toolbar.el).find(".button").addClass("disabled_toolbar").removeClass("on"),
    $(a.workspace.el).find(".fields_list .disabled_toolbar").removeClass("disabled_toolbar"), $(a.workspace.toolbar.el).find(".about, .new, .open, .save, .edit, .run,.auto,.non_empty,.toggle_fields,.toggle_sidebar,.switch_to_mdx, .mdx").removeClass("disabled_toolbar"));
   this.reflect_properties()
  },
  template: function() {
   var a = $("#template-workspace-toolbar").html() || "";
   return _.template(a)()
  },
  render: function() {
   $(this.el).html(this.template());
   return this
  },
  translate: function() {},
  call: function(a) {
   a.preventDefault();
   var b = a.target.hash.replace("#", "");
   if (!$(a.target).hasClass("disabled_toolbar") && this[b]) this[b](a);
   return !1
  },
  reflect_properties: function() {
   var a = this.workspace.query.model.properties ? this.workspace.query.model.properties : Settings.QUERY_PROPERTIES;
   !0 === a["saiku.olap.query.nonempty"] && $(this.el).find(".non_empty").addClass("on");
   !0 === a["saiku.olap.query.automatic_execution"] && $(this.el).find(".auto").addClass("on");
   !0 !== a["saiku.olap.query.drillthrough"] && $(this.el).find(".drillthrough, .drillthrough_export").addClass("disabled_toolbar");
   !0 !== a["org.saiku.query.explain"] && $(this.el).find(".explain_query").addClass("disabled_toolbar");
   !0 !== a["org.saiku.connection.scenario"] ? $(this.el).find(".query_scenario").addClass("disabled_toolbar") : ($(this.el).find(".query_scenario").removeClass("disabled_toolbar"), $(this.el).find(".drillthrough, .drillthrough_export").addClass("disabled_toolbar"));
   "true" != a["saiku.olap.query.limit"] && !0 !== a["saiku.olap.query.filter"] || $(this.workspace.el).find(".fields_list_header").addClass("limit");
   "undefined" !==
   this.workspace.query.getProperty("saiku.olap.result.formatter") && "flattened" == this.workspace.query.getProperty("saiku.olap.result.formatter") && ($(this.el).find(".group_parents").hasClass("on") || $(this.el).find(".group_parents").addClass("on"));
   0 < $(this.workspace.el).find(".workspace_results tbody.ui-selectable").length && $(this.el).find(".zoom_mode").addClass("on");
   $(this.el).find(".spark_bar, .spark_line").removeClass("on");
   $(this.el).find("a.edit").removeClass("disabled_toolbar");
   "VIEW" == Settings.MODE ||
    this.workspace.isReadOnly ? ($(this.el).find("a.edit").hide(), $(this.el).find("a.save").hide()) : ("view" == this.workspace.viewState ? $(this.el).find("a.edit").removeClass("on") : $(this.el).find("a.edit").addClass("on"), $(this.el).find("a.edit").show("normal"))
  },
  new_query: function(a) {
   "undefined" != typeof ga && ga("send", "event", "Toolbar", "New Query");
   this.workspace.switch_view_state("edit");
   this.workspace.new_query();
   return !1
  },
  edit_query: function(a) {
   $(a.target).toggleClass("on");
   $(a.target).hasClass("on") ?
    this.workspace.switch_view_state("edit") : this.workspace.switch_view_state("view")
  },
  save_query: function(a) {
   this.workspace.query && ("undefined" != typeof this.editor && (a = this.editor.getValue(), this.workspace.query.model.mdx = a), (new SaveQuery({
    query: this.workspace.query
   })).render().open())
  },
  open_query: function(a) {
   (new OpenDialog).render().open()
  },
  run_query: function(a) {
   this.workspace.query.run(!0)
  },
  automatic_execution: function(a) {
   var b = !this.workspace.query.getProperty("saiku.olap.query.automatic_execution");
   this.workspace.query.setProperty("saiku.olap.query.automatic_execution", b);
   b ? $(a.target).addClass("on") : $(a.target).removeClass("on")
  },
  toggle_fields: function(a) {
   a && $(this.el).find(".toggle_fields").toggleClass("on");
   $(this.el).find(".toggle_fields").hasClass("on") ? this.toggle_fields_action("show") : this.toggle_fields_action("hide")
  },
  toggle_fields_action: function(a, b) {
   "show" == a && $(".workspace_editor").is(":visible") || "hide" == a && $(".workspace_editor").is(":hidden") || (b ? ($(".workspace_editor").css("height",
    ""), $(".workspace_editor").is(":hidden") ? $(".workspace_editor").show() : $(".workspace_editor").hide()) : "hide" == a ? $(this.workspace.el).find(".workspace_editor").hide() : $(this.workspace.el).find(".workspace_editor").show())
  },
  about: function() {
   (new AboutModal).render().open();
   return !1
  },
  toggle_sidebar: function() {
   this.workspace.toggle_sidebar()
  },
  group_parents: function(a) {
   a && $(a.target).toggleClass("on");
   this.$el.find(".group_parents").hasClass("on") ? this.workspace.query.setProperty("saiku.olap.result.formatter",
    "flattened") : this.workspace.query.setProperty("saiku.olap.result.formatter", "flat");
   this.workspace.query.run()
  },
  non_empty: function(a) {
   var b = !this.workspace.query.getProperty("saiku.olap.query.nonempty");
   this.workspace.query.helper.nonEmpty(b);
   this.workspace.query.setProperty("saiku.olap.query.nonempty", b);
   $(a.target).toggleClass("on");
   this.workspace.query.run()
  },
  swap_axis: function(a) {
   $(this.workspace.el).find(".workspace_results table").html("");
   this.workspace.query.helper.swapAxes();
   this.workspace.sync_query();
   this.workspace.query.run(!0)
  },
  check_modes: function(a) {
   if ("undefined" !== typeof a && null !== a)
    if (0 < $(this.workspace.el).find(".workspace_results tbody.ui-selectable").length && $(this.workspace.el).find(".workspace_results tbody").selectable("destroy"), !$(a).hasClass("on")) $(this.workspace.el).find("td.data").removeClass("cellhighlight").unbind("click"), $(this.workspace.el).find(".table_mode").removeClass("on"), this.workspace.query.run();
    else if ($(a).hasClass("drillthrough_export")) $(this.workspace.el).find("td.data").addClass("cellhighlight").unbind("click").click(this.clicked_cell_drillthrough_export),
    $(this.workspace.el).find(".query_scenario, .drillthrough, .zoom_mode, .drillacross").removeClass("on");
   else if ($(a).hasClass("drillthrough")) $(this.workspace.el).find("td.data").addClass("cellhighlight").unbind("click").click(this.clicked_cell_drillthrough), $(this.workspace.el).find(".query_scenario, .drillthrough_export, .zoom_mode, .drillacross").removeClass("on");
   else if ($(a).hasClass("query_scenario")) this.workspace.query.scenario.activate(), $(this.workspace.el).find(".drillthrough, .drillthrough_export, .zoom_mode, .drillacross").removeClass("on");
   else if ($(a).hasClass("drillacross")) $(this.workspace.el).find("td.data").addClass("cellhighlight").unbind("click").click(this.clicked_cell_drillacross), $(this.workspace.el).find(".query_scenario, .drillthrough, .drillthrough_export, .zoom_mode").removeClass("on");
   else if ($(a).hasClass("zoom_mode")) {
    var b = this;
    $(b.workspace.el).find(".workspace_results tbody").selectable({
     filter: "td",
     stop: function(a, d) {
      var e = [];
      $(b.workspace.el).find(".workspace_results").find("td.ui-selected div").each(function(a,
       b) {
       var c = $(b).attr("rel");
       c && e.push(c)
      });
      $(b.workspace.el).find(".workspace_results").find(".ui-selected").removeClass(".ui-selected");
      e = _.uniq(e);
      0 < e.length && b.workspace.query.action.put("/zoomin", {
       success: function(a, c) {
        b.workspace.query.parse(c);
        b.workspace.unblock();
        b.workspace.sync_query();
        Saiku.ui.unblock();
        b.workspace.query.run()
       },
       data: {
        selections: JSON.stringify(e)
       }
      })
     }
    });
    $(this.workspace.el).find(".drillthrough, .drillthrough_export, .query_scenario, .drillacross, .about").removeClass("on")
   }
  },
  query_scenario: function(a) {
   $(a.target).toggleClass("on");
   this.check_modes($(a.target))
  },
  zoom_mode: function(a) {
   $(a.target).toggleClass("on");
   this.check_modes($(a.target))
  },
  drillacross: function(a) {
   $(a.target).toggleClass("on");
   this.check_modes($(a.target))
  },
  drillthrough: function(a) {
   $(a.target).toggleClass("on");
   this.check_modes($(a.target))
  },
  display_drillthrough: function(a, b) {
   this.workspace.table.render({
    data: b
   });
   Saiku.ui.unblock()
  },
  export_drillthrough: function(a) {
   $(a.target).toggleClass("on");
   this.check_modes($(a.target))
  },
  clicked_cell_drillacross: function(a) {
   $target = $(a.target).hasClass("data") ? $(a.target).find("div") : $(a.target);
   a = $target.attr("rel");
   (new DrillAcrossModal({
    workspace: this.workspace,
    title: "Drill Across",
    action: "export",
    position: a,
    query: this.workspace.query
   })).open()
  },
  clicked_cell_drillthrough_export: function(a) {
   $target = $(a.target).hasClass("data") ? $(a.target).find("div") : $(a.target);
   a = $target.attr("rel");
   (new DrillthroughModal({
    workspace: this.workspace,
    maxrows: 1E4,
    title: "Drill-Through to CSV",
    action: "export",
    position: a,
    query: this.workspace.query
   })).open()
  },
  clicked_cell_drillthrough: function(a) {
   $target = $(a.target).hasClass("data") ? $(a.target).find("div") : $(a.target);
   a = $target.attr("rel");
   (new DrillthroughModal({
    workspace: this.workspace,
    maxrows: 200,
    title: "Drill-Through",
    action: "table",
    success: this.display_drillthrough,
    position: a,
    query: this.workspace.query
   })).open()
  },
  swap_axes_on_dropzones: function(a, b) {
   this.workspace.query.parse(b);
   this.workspace.unblock();
   this.workspace.sync_query();
   Saiku.ui.unblock();
   this.workspace.unblock();
   this.workspace.sync_query();
   Saiku.ui.unblock()
  },
  show_mdx: function(a) {
   (new MDXModal({
    mdx: this.workspace.query.model.mdx
   })).render().open()
  },
  workspace_titles: function(a) {
   (new TitlesModal({
    query: this.workspace.query
   })).render().open()
  },
  export_xls: function(a) {
   void 0 != this.workspace.query.name ? (a = this.workspace.query.name.substring(this.workspace.query.name.lastIndexOf("/") + 1).slice(0, -5), window.location = Settings.REST_URL + this.workspace.query.url() + "/export/xls/" + this.workspace.query.getProperty("saiku.olap.result.formatter") +
    "?exportname\x3d" + encodeURIComponent(a) + "xls") : window.location = Settings.REST_URL + this.workspace.query.url() + "/export/xls/" + this.workspace.query.getProperty("saiku.olap.result.formatter")
  },
  export_csv: function(a) {
   void 0 != this.workspace.query.name ? (a = this.workspace.query.name.substring(this.workspace.query.name.lastIndexOf("/") + 1).slice(0, -6), window.location = Settings.REST_URL + this.workspace.query.url() + "/export/csv/" + this.workspace.query.getProperty("saiku.olap.result.formatter") + "?exportname\x3d" + encodeURIComponent(a)) :
    window.location = Settings.REST_URL + this.workspace.query.url() + "/export/csv/" + this.workspace.query.getProperty("saiku.olap.result.formatter")
  },
  export_pdf: function(a) {
   void 0 != this.workspace.query.name ? (a = this.workspace.query.name.substring(this.workspace.query.name.lastIndexOf("/") + 1).slice(0, -6), window.location = Settings.REST_URL + this.workspace.query.url() + "/export/pdf/" + this.workspace.query.getProperty("saiku.olap.result.formatter") + "?exportname\x3d" + encodeURIComponent(a)) : window.location = Settings.REST_URL +
    this.workspace.query.url() + "/export/pdf/" + this.workspace.query.getProperty("saiku.olap.result.formatter")
  },
  switch_to_mdx: function(a) {
   var b = this;
   $(this.workspace.el).find(".workspace_fields").addClass("hide");
   $(this.el).find(".auto, .query_scenario, .buckets, .non_empty, .swap_axis, .mdx, .switch_to_mdx, .zoom_mode, .drillacross").parent().hide();
   0 < $(this.workspace.el).find(".workspace_results tbody.ui-selectable").length && $(this.workspace.el).find(".workspace_results tbody").selectable("destroy");
   $(this.el).find(".run").attr("href", "#run_mdx");
   $(this.el).find(".run, .save, .open, .new, .edit").removeClass("disabled_toolbar");
   if ("view" != Settings.MODE && "table" != Settings.MODE && !this.workspace.isReadOnly) {
    $mdx_editor = $(this.workspace.el).find(".mdx_input");
    $(this.workspace.el).find(".workspace_editor .mdx_input, .workspace_editor .editor_info, .workspace_editor").removeClass("hide").show();
    this.editor = ace.edit("mdx_editor");
    this.editor.setShowPrintMargin(!1);
    this.editor.setFontSize(11);
    this.editor.commands.addCommand({
     name: "runmdx",
     bindKey: {
      win: "Ctrl-Enter",
      mac: "Command-Enter"
     },
     exec: function(a) {
      b.run_mdx()
     },
     readOnly: !0
    });
    a = function() {
     var a = b.editor.getCursorPosition();
     $mdx_editor.parent().find(".editor_info").html("\x26nbsp; " + (a.row + 1) + ", " + a.column)
    };
    this.editor.on("changeSelection", a);
    a();
    var c = function() {
     var a = $(document).height() / 3,
      a = Math.floor(a / b.editor.renderer.lineHeight),
      a = ((b.editor.getSession().getScreenLength() > a ? a : b.editor.getSession().getScreenLength()) + 1) * b.editor.renderer.lineHeight + b.editor.renderer.scrollBar.getWidth();
     $mdx_editor.height(a.toString() + "px");
     b.editor.resize();
     b.workspace.adjust()
    };
    a = function() {
     var a = b.editor.session;
     b.editor.resize();
     a.setUseWrapMode(!0);
     if (a.getUseWrapMode()) {
      var c = b.editor.renderer.characterWidth,
       f = b.editor.renderer.scroller.clientWidth;
      0 < f && a.setWrapLimitRange(null, parseInt(f / c, 10))
     }
    };
    a();
    c();
    b.editor.focus();
    b.editor.clearSelection();
    b.editor.getSession().setValue("");
    b.editor.getSession().on("change", c);
    $(window).resize(a);
    b.editor.on("changeSelection", c);
    b.editor.on("focus",
     function(a) {
      c();
      return !0
     });
    b.editor.on("blur", function(a) {
     100 < $(b.workspace.el).find(".mdx_input").height() && $(b.workspace.el).find(".mdx_input").height(100);
     b.editor.resize();
     b.workspace.adjust();
     return !0
    });
    this.editor.getSession().setMode("ace/mode/text")
   }
   this.workspace.dimension_list && $(this.workspace.el).find(".sidebar_inner ul li a").css({
    fontWeight: "normal"
   }).parent("li").removeClass("ui-draggable ui-draggable-disabled ui-state-disabled");
   this.activate_buttons({
    workspace: this.workspace
   });
   $(this.workspace.toolbar.el).find(".run").removeClass("disabled_toolbar");
   $(this.workspace.table.el).empty();
   this.workspace.adjust();
   this.post_mdx_transform()
  },
  post_mdx_transform: function() {
   var a = this;
   "MDX" !== this.workspace.query.model.type && (this.workspace.query.model.queryModel = {}, this.workspace.query.model.type = "MDX", this.workspace.query.setProperty("saiku.olap.result.formatter", "flat"), a.workspace.query.helper.model().parameters = {});
   var b = this.workspace.query.model.mdx;
   a.editor && (a.editor.setValue(b, 0), a.editor.clearSelection(), a.editor.focus());
   $(a.el).find(".group_parents").removeClass("on");
   if (Settings.ALLOW_PARAMETERS) {
    var c = function() {
      var b = a.editor.getValue(),
       c = [];
      if (b)
       for (var f = 0, g = b.length; f < g - 1; f++)
        if ("$" === b[f] && "{" === b[f + 1]) {
         for (var h = "", k = !1, f = f + 2; f < g; f++)
          if ("}" !== b[f]) h += b[f];
          else {
           k = !0;
           f++;
           break
          }
         k && h && 0 < h.length && c.push(h)
        }
      var l = a.workspace.query.helper.model().parameters,
       m = {};
      _.each(c, function(a) {
       m[a] = l[a] ? l[a] : ""
      });
      a.workspace.query.helper.model().parameters = m;
      a.workspace.update_parameters()
     },
     b = function() {
      _.delay(c, 1E3)
     };
    a.editor && (a.editor.getSession().off("change", b), a.editor.getSession().on("change",
     b));
    a.workspace.update_parameters()
   }
  },
  run_mdx: function(a) {
   100 < $(this.workspace.el).find(".mdx_input").height() && $(this.workspace.el).find(".mdx_input").height(100);
   this.editor.resize();
   a = this.editor.getValue();
   this.workspace.query.model.mdx = a;
   this.workspace.query.run(!0)
  },
  explain_query: function(a) {
   this.workspace.query.action.gett("/explain", {
    success: function(a, c) {
     var d = "\x3ctextarea style\x3d'width: " + ($("body").width() - 165) + "px;height:" + ($("body").height() - 175) + "px;'\x3e",
      d = null !== c && null !== c.error ?
      d + c.error : c.cellset && 0 === c.cellset.length ? d + "Empty explain plan!" : d + c.cellset[1][0].value,
      d = d + "\x3c/textarea\x3e";
     Saiku.ui.unblock();
     $.fancybox('\x3cdiv id\x3d"fancy_results" class\x3d"workspace_results" style\x3d"overflow:visible"\x3e\x3ctable\x3e\x3ctr\x3e\x3cth clas\x3d"row_header"\x3eExplain Plan\x3c/th\x3e\x3c/tr\x3e\x3ctr\x3e\x3ctd\x3e' + d + "\x3c/td\x3e\x3c/tr\x3e\x3c/table\x3e\x3c/div\x3e", {
      autoDimensions: !1,
      autoScale: !1,
      height: $("body").height() - 100,
      width: $("body").width() - 100,
      transitionIn: "none",
      transitionOut: "none"
     })
    }
   });
   return !1
  }
 }),
 WorkspaceDropZone = Backbone.View.extend({
  template: function() {
   var a = $("#template-workspace-dropzones").html() || "";
   return _.template(a)()
  },
  events: {
   "sortstop .fields_list_body.details": "set_measures",
   "sortstop .axis_fields": "select_dimension",
   "click .d_measure": "remove_measure_click",
   "click .d_level": "selections",
   "click .measure_fields.limit": "measure_action",
   "click .axis_fields_header.limit": "limit_axis",
   "click .clear_axis": "clear_axis"
  },
  initialize: function(a) {
   this.workspace =
    a.workspace;
   _.bindAll(this, "clear_axis", "set_measures")
  },
  render: function() {
   var a = this;
   $(this.el).html(this.template());
   $(this.el).find(".fields_list_body.details ul.connectable").sortable({
    items: "\x3e li",
    opacityg: .6,
    placeholder: "placeholder",
    tolerance: "pointer",
    containment: $(a.workspace.el),
    start: function(a, c) {
     c.placeholder.text(c.helper.text())
    }
   });
   $(this.el).find(".axis_fields ul.connectable").sortable({
    connectWith: $(a.el).find(".axis_fields ul.connectable"),
    forcePlaceholderSize: !1,
    forceHelperSize: !0,
    items: "li.selection",
    opacity: .6,
    placeholder: "placeholder",
    tolerance: "touch",
    cursorAt: {
     top: 10,
     left: 60
    },
    containment: $(a.workspace.el),
    start: function(b, c) {
     var d = $(c.helper).find("a").parent().parent().attr("hierarchycaption");
     c.placeholder.text(d);
     $(c.helper).css({
      width: "auto",
      height: "auto"
     });
     $(a.el).find(".axis_fields ul.hierarchy li.d_level:visible").addClass("temphide").hide()
    }
   });
   return this
  },
  set_measures: function(a, b) {
   var c = [];
   $(this.el).find(".fields_list_body.details ul.connectable li.d_measure").each(function(a,
    b) {
    var f = {
     name: $(b).find("a").attr("measure"),
     type: $(b).find("a").attr("type")
    };
    c.push(f);
    Saiku.events.trigger("workspaceDropZone:select_measure", this, {
     measure: f
    })
   });
   this.workspace.query.helper.setMeasures(c);
   this.workspace.sync_query();
   this.workspace.query.run()
  },
  remove_measure_click: function(a) {
   a.preventDefault();
   ($(a.target).hasClass("d_measure") ? $(a.target).find("a") : $(a.target)).parent().remove();
   this.set_measures()
  },
  remove_dimension: function(a, b) {
   if ($(b.helper).hasClass("d_measure")) $(b.helper).detach(),
    this.set_measures();
   else {
    var c = $(b.helper).find("a").attr("hierarchy");
    $(this.el).find('ul.hierarchy[hierarchy\x3d"' + c + '"]').parents(".fields_list").attr("title");
    $(b.helper).find("a").attr("level");
    this.workspace.query.helper.removeHierarchy(c);
    this.workspace.sync_query();
    this.workspace.query.run()
   }
  },
  synchronize_query: function() {
   var a = this;
   this.reset_dropzones();
   var b = this.workspace.query.helper.model();
   if (b.hasOwnProperty("queryModel") && b.queryModel.hasOwnProperty("axes")) {
    var c = b.queryModel.axes,
     d;
    for (d in c) {
     var e = $(a.el).find('.fields_list[title\x3d"' + d + '"]');
     _.each(c[d].hierarchies, function(b) {
      var c = $(a.workspace.dimension_list.el).find('ul.d_hierarchy[hierarchy\x3d"' + b.name + '"]').clone().removeClass("d_hierarchy").addClass("hierarchy");
      c.find("li.d_level").hide();
      for (var d in b.levels) c.find('li a[level\x3d"' + d + '"]').parent().show(), $(a.workspace.dimension_list.el).find('ul.d_hierarchy[hierarchy\x3d"' + b.name + '"] li a[level\x3d"' + d + '"]').parent().draggable("disable").parents(".parent_dimension").find(".folder_collapsed").addClass("selected");
      b = $('\x3cli class\x3d"selection"\x3e\x3c/li\x3e');
      b.append(c);
      b.appendTo(e.find("ul.connectable"))
     })
    }
    _.each(b.queryModel.details.measures || [], function(b) {
     b = $(a.workspace.dimension_list.el).find('.measure_tree a.measure[measure\x3d"' + b.name + '"]').parent();
     b.clone().show().appendTo($(a.el).find(".fields_list_body.details ul.connectable"));
     b.draggable("disable")
    });
    this.update_dropzones()
   }
  },
  reset_dropzones: function() {
   $(this.el).find(".fields_list_body ul.connectable").find("li.selection, li.d_measure").remove();
   $(this.workspace.dimension_list.el).find("li.ui-draggable-disabled").draggable("enable");
   $(this.el).find('.fields_list[title\x3d"ROWS"] .limit').removeClass("on");
   $(this.el).find('.fields_list[title\x3d"COLUMNS"] .limit').removeClass("on");
   $(this.workspace.el).find(".fields_list_body .clear_axis").addClass("hide")
  },
  update_dropzones: function() {
   $(this.workspace.el).find(".fields_list_body").each(function(a, b) {
    var c = $(b);
    0 === c.find("ul.connectable li.selection, ul.connectable li.d_measure").length ? c.siblings(".clear_axis").addClass("hide") :
     c.siblings(".clear_axis").removeClass("hide")
   })
  },
  clear_axis: function(a) {
   a.preventDefault();
   a = $(a.target).siblings(".fields_list_body").parent().attr("title");
   "DETAILS" == a ? this.workspace.query.helper.clearMeasures() : this.workspace.query.helper.clearAxis(a);
   Saiku.session.trigger("workspaceDropZone:clear_axis", {
    workspace: this.workspace,
    axis: a
   });
   this.workspace.sync_query();
   this.workspace.query.run();
   return !1
  },
  select_dimension: function(a, b) {
   Saiku.session.trigger("workspaceDropZone:select_dimension", {
    workspace: this.workspace
   });
   if ($(b.item).is(":visible")) {
    $(this.el).find(".axis_fields ul.hierarchy").each(function(a, b) {
     $(b).find("li.temphide").show().removeClass("temphide")
    });
    var c = b.item.find(".level").attr("hierarchy"),
     d = -1;
    b.item.parents("ul.connectable").find("li.selection").each(function(a, b) {
     $(b).find("ul.hierarchy").attr("hierarchy") == c && (d = a)
    });
    var e = b.item.parents(".axis_fields").parent().attr("title"),
     f = $(a.target).parents(".axis_fields").parent().attr("title"),
     g = b.item.hasClass("d_level"),
     h = b.item.hasClass("dimension-level-calcmember"),
     k;
    h || (g ? (k = b.item.find("a.level").attr("level"), this.workspace.query.helper.includeLevel(e, c, k, d)) : this.workspace.query.helper.moveHierarchy(f, e, c, d));
    $(b.item).detach();
    this.workspace.sync_query();
    this.workspace.query.run();
    Saiku.events.trigger("workspaceDropZone:select_dimension", this, {
     level: k,
     uniquename: void 0,
     toAxis: e,
     isNew: g,
     isCalc: h,
     hierarchy: c
    })
   }
  },
  find_type_time: function(a, b, c) {
   void 0 === this.workspace.metadata && (this.workspace.metadata = Saiku.session.sessionworkspace.cube[this.workspace.selected_cube]);
   var d = {};
   d.dimensions = _.findWhere(this.workspace.metadata.attributes.data.dimensions, {
    name: a
   });
   void 0 === b && (b = a);
   d.hierarchies = _.findWhere(d.dimensions.hierarchies, {
    name: b
   });
   if (void 0 === d.hierarchies || null === d.hierarchies) d.hierarchies = _.findWhere(d.dimensions.hierarchies, {
    name: a + "." + b
   });
   d.level = _.findWhere(d.hierarchies.levels, {
    name: c
   });
   if (null === d.level || void 0 === d.level) d.level = _.findWhere(d.hierarchies.levels, {
    caption: c
   });
   return d
  },
  selections: function(a, b) {
   a && a.preventDefault();
   var c = $(a.target).hasClass("d_level") ?
    $(a.target).find(".level") : $(a.target),
    d = c.attr("hierarchy").replace(/[\[\]]/gi, "").split(".")[0],
    e = c.attr("hierarchy").replace(/[\[\]]/gi, "").split(".")[1] ? c.attr("hierarchy").replace(/[\[\]]/gi, "").split(".")[1] : c.attr("hierarchy").replace(/[\[\]]/gi, "").split(".")[0],
    f = c.attr("level"),
    g = this.find_type_time(d, e, f),
    h = c.attr("hierarchy"),
    k = c.attr("href").replace("#", "");
   this.member = new Member({}, {
    cube: this.workspace.selected_cube,
    dimension: k
   });
   var l = decodeURIComponent(this.member.hierarchy),
    l = this.workspace.query.helper.getHierarchy(l),
    m;
   l && l.levels.hasOwnProperty(f) && (m = l.levels[f]);
   g.level && void 0 !== g.level.annotations && null !== g.level.annotations && (void 0 !== g.level.annotations.AnalyzerDateFormat || void 0 !== g.level.annotations.SaikuDayFormatString) && (_.has(m, "selection") && 0 === m.selection.members.length || 1 === _.size(m) && _.has(m, "name") || _.has(m, "mdx") && m.mdx || 2 === _.size(m) && _.has(m, "name") && _.has(m, "mdx")) ? (new DateFilterModal({
    dimension: d,
    hierarchy: e,
    target: c,
    name: c.attr("level"),
    data: g,
    analyzerDateFormat: g.level.annotations.AnalyzerDateFormat,
    dimHier: h,
    key: k,
    workspace: this.workspace
   })).open() : (new SelectionsModal({
    target: c,
    name: c.text(),
    key: k,
    workspace: this.workspace
   })).open();
   return !1
  },
  measure_action: function(a) {
   var b = this;
   if ("undefined" == typeof this.workspace.query || "QUERYMODEL" != this.workspace.query.model.type || "view" == Settings.MODE) return !1;
   a = $(a.target).hasClass("limit") ? $(a.target) : $(a.target).parent();
   var c = {
    HEADER: {
     name: "Position",
     disabled: !0,
     i18n: !0
    },
    sep1: "---------",
    BOTTOM_COLUMNS: {
     name: "Columns | Measures",
     i18n: !0
    },
    TOP_COLUMNS: {
     name: "Measures | Columns",
     i18n: !0
    },
    BOTTOM_ROWS: {
     name: "Rows | Measures",
     i18n: !0
    },
    TOP_ROWS: {
     name: "Measures | Rows",
     i18n: !0
    },
    sep2: "---------",
    reset: {
     name: "Reset Default",
     i18n: !0
    },
    cancel: {
     name: "Cancel",
     i18n: !0
    }
   };
   $.each(c, function(a, b) {
    recursive_menu_translate(b, Saiku.i18n.po_file)
   });
   $.contextMenu("destroy", ".limit");
   $.contextMenu({
    appendTo: a,
    selector: ".limit",
    ignoreRightClick: !0,
    build: function(a, e) {
     var f = b.workspace.query;
     return {
      callback: function(a, b) {
       var c = f.helper.model().queryModel.details;
       if ("cancel" !== a) {
        if ("reset" === a) c.location =
         SaikuOlapQueryTemplate.queryModel.details.location, c.axis = SaikuOlapQueryTemplate.queryModel.details.axis;
        else {
         var d = a.split("_")[0],
          e = a.split("_")[1];
         c.location = d;
         c.axis = e
        }
        f.run()
       }
      },
      items: c
     }
    }
   });
   a.contextMenu()
  },
  limit_axis: function(a) {
   var b = this;
   if ("undefined" == typeof this.workspace.query || "QUERYMODEL" != this.workspace.query.model.type || "view" == Settings.MODE) return !1;
   var c = $(a.target).hasClass("limit") ? $(a.target) : $(a.target).parent(),
    d = c.siblings(".fields_list_body").parent().attr("title");
   $.contextMenu("destroy",
    ".limit");
   $.contextMenu({
    appendTo: c,
    selector: ".limit",
    ignoreRightClick: !0,
    build: function(a, f) {
     var g = {},
      h = Saiku.session.sessionworkspace.cube[b.workspace.selected_cube].get("data").measures,
      k = b.workspace.query.helper.getAxis(d),
      l, m, n, s, q, t, u, z, w, B = !1,
      r = !1,
      D = !1;
     k && k.filters && _.each(k.filters, function(a) {
      "N" == a.flavour && (l = k["function"], m = a.expressions[0], n = a.expressions[1], D = !0);
      "Generic" == a.flavour && (s = a.expressions[0], B = !0)
     });
     k && k.sortOrder && (q = k.sortOrder, t = k.sortEvaluationLiteral, r = !0);
     k && k.aggregators &&
      0 < k.aggregators.length && (w = k.aggregators[0]);
     null !== l && null === n ? z = l + "###SEPARATOR###" + m : null !== l && null !== n && null !== m && (z = "custom");
     r && null !== q && (u = "customsort");
     _.each(h, function(a) {
      g[a.uniqueName] = {
       name: a.caption,
       payload: {
        n: 10,
        sortliteral: a.uniqueName
       }
      }
     });
     _.each(k.hierarchies, function(a) {
      for (var b in a.levels) console.log(b)
     });
     var y = function(a, b) {
       var c = {},
        d;
       for (d in a) c[b + "###SEPARATOR###" + d] = _.clone(a[d]), c[b + "###SEPARATOR###" + d].fun = b, b == l && n == d && a[d].payload.n == m && (z = b + "Quick", c[b + "###SEPARATOR###" +
        d].name = "\x3cb\x3e" + a[d].name + "\x3c/b\x3e"), b == q && t == d && (u = b + "Quick", c[b + "###SEPARATOR###" + d].name = "\x3cb\x3e" + a[d].name + "\x3c/b\x3e");
       return c
      },
      y = {
       filter: {
        name: "Filter",
        i18n: !0,
        items: {
         customfilter: {
          name: "Custom...",
          i18n: !0
         },
         clearfilter: {
          name: "Clear Filter",
          i18n: !0
         }
        }
       },
       limit: {
        name: "Limit",
        i18n: !0,
        items: {
         "TopCount###SEPARATOR###10": {
          name: "Top 10",
          i18n: !0
         },
         "BottomCount###SEPARATOR###10": {
          name: "Bottom 10",
          i18n: !0
         },
         TopCountQuick: {
          name: "Top 10 by...",
          i18n: !0,
          items: y(g, "TopCount")
         },
         BottomCountQuick: {
          name: "Bottom 10 by...",
          i18n: !0,
          items: y(g, "BottomCount")
         },
         customtop: {
          name: "Custom Limit...",
          i18n: !0
         },
         clearlimit: {
          name: "Clear Limit",
          i18n: !0
         }
        }
       },
       sort: {
        name: "Sort",
        i18n: !0,
        items: {
         ASCQuick: {
          name: "Ascending",
          i18n: !0,
          items: y(g, "ASC")
         },
         DESCQuick: {
          name: "Descending",
          i18n: !0,
          items: y(g, "DESC")
         },
         BASCQuick: {
          name: "Ascending (Breaking Hierarchy)",
          i18n: !0,
          items: y(g, "BASC")
         },
         BDESCQuick: {
          name: "Descending (Breaking Hierarchy)",
          i18n: !0,
          items: y(g, "BDESC")
         },
         customsort: {
          name: "Custom...",
          i18n: !0
         },
         clearsort: {
          name: "Clear Sort",
          i18n: !0
         }
        }
       },
       grand_totals: {
        name: "Grand totals",
        i18n: !0,
        items: {
         show_totals_not: {
          name: "None",
          i18n: !0
         },
         show_totals_sum: {
          name: "Sum",
          i18n: !0
         },
         show_totals_min: {
          name: "Min",
          i18n: !0
         },
         show_totals_max: {
          name: "Max",
          i18n: !0
         },
         show_totals_avg: {
          name: "Avg",
          i18n: !0
         }
        }
       },
       cancel: {
        name: "Cancel",
        i18n: !0
       }
      };
     $.each(y, function(a, b) {
      recursive_menu_translate(b, Saiku.i18n.po_file)
     });
     var v = y.grand_totals.items;
     if (w)
      for (var G in v) G.substring(12) == w && (v[G].name = "\x3cb\x3e" + v[G].name + "\x3c/b");
     else v.show_totals_not.name = "\x3cb\x3e" + v.show_totals_not.name + "\x3c/b";
     g["10"] = {
      payload: {
       n: 10
      }
     };
     B && (w = y.filter, w.name = "\x3cb\x3e" + w.name + "\x3c/b\x3e", w.items.customfilter.name = "\x3cb\x3e" + w.items.customfilter.name + "\x3c/b\x3e");
     r && (r = y.sort.items, y.sort.name = "\x3cb\x3e" + y.sort.name + "\x3c/b\x3e", u in r && (r[u].name = "\x3cb\x3e" + r[u].name + "\x3c/b\x3e"));
     D && (r = y.limit.items, y.limit.name = "\x3cb\x3e" + y.limit.name + "\x3c/b\x3e", z in r && (r[z].name = "\x3cb\x3e" + r[z].name + "\x3c/b\x3e"));
     return {
      callback: function(a, e) {
       var f;
       if ("cancel" != a)
        if ("clearfilter" == a) c.removeClass("on"), b.workspace.query.helper.removeFilter(k,
         "Generic"), b.synchronize_query(), b.workspace.query.run();
        else if ("customfilter" == a) f = function(a) {
        var c = [];
        c.push(a);
        b.workspace.query.helper.removeFilter(k, "Generic");
        k.filters.push({
         flavour: "Generic",
         operator: null,
         "function": "Filter",
         expressions: c
        });
        b.synchronize_query();
        b.workspace.query.run()
       }, (new FilterModal({
        axis: d,
        success: f,
        query: b.workspace.query,
        expression: s,
        expressionType: "Filter",
        workspace: b.workspace
       })).render().open();
       else if ("stringfilter" == a) f = function(a, c, d) {
        c = [];
        c.push(a + ('.CurrentMember.Name MATCHES ("(?i).*' +
         d + '.*")'));
        b.workspace.query.helper.removeFilter(k, "Generic");
        k.filters.push({
         flavour: "Generic",
         operator: null,
         "function": "Filter",
         expressions: c
        });
        b.synchronize_query();
        b.workspace.query.run()
       }, (new StringFilterModal({
        axis: d,
        success: f,
        query: b.workspace.query,
        expression: s,
        expressionType: "Filter",
        workspace: b.workspace
       })).render().open();
       else if ("clearlimit" == a) c.removeClass("on"), b.workspace.query.helper.removeFilter(k, "N"), b.synchronize_query(), b.workspace.query.run();
       else if ("customtop" == a) f = function(a,
        c, d) {
        var e = [];
        e.push(c);
        d && e.push(d);
        b.workspace.query.helper.removeFilter(k, "N");
        k.filters.push({
         flavour: "N",
         operator: null,
         "function": a,
         expressions: e
        });
        b.synchronize_query();
        b.workspace.query.run()
       }, (new CustomFilterModal({
        axis: d,
        measures: h,
        success: f,
        query: b.workspace.query,
        func: l,
        n: m,
        sortliteral: n
       })).render().open();
       else if ("customsort" == a) f = function(a, c) {
        k.sortOrder = a;
        k.sortEvaluationLiteral = c;
        b.synchronize_query();
        b.workspace.query.run()
       }, (new FilterModal({
        axis: d,
        success: f,
        query: b.workspace.query,
        expression: t,
        expressionType: "Order"
       })).render().open();
       else {
        if ("clearsort" == a) k.sortOrder = null, k.sortEvaluationLiteral = null, b.synchronize_query();
        else if (0 === a.indexOf("show_totals_")) {
         f = a.substring(12);
         var r = [];
         r.push(f);
         k.aggregators = r
        } else {
         f = a.split("###SEPARATOR###")[0];
         var w = a.split("###SEPARATOR###")[1]; - 1 < _.indexOf(["ASC", "BASC", "DESC", "BDESC"], f) ? (k.sortOrder = f, k.sortEvaluationLiteral = g[w].payload.sortliteral) : -1 < _.indexOf(["Param"], f) ? (console.log("here"), k.sortEvaluationLiteral = g[w].payload.sortliteral) :
          (r = [], r.push(g[w].payload.n), (w = g[w].payload.sortliteral) && r.push(w), b.workspace.query.helper.removeFilter(k, "N"), k.filters.push({
           flavour: "N",
           operator: null,
           "function": f,
           expressions: r
          }));
         b.synchronize_query()
        }
        b.workspace.query.run()
       }
      },
      items: y
     }
    }
   });
   c.contextMenu()
  }
 }),
 Table = Backbone.View.extend({
  className: "table_wrapper",
  events: {
   "click th.row": "clicked_cell",
   "click th.col": "clicked_cell"
  },
  initialize: function(a) {
   this.workspace = a.workspace;
   this.renderer = new SaikuTableRenderer;
   _.bindAll(this, "render", "process_data");
   this.workspace.bind("query:result", this.render);
   this.id = _.uniqueId("table_");
   $(this.el).attr("id", this.id)
  },
  clicked_cell: function(a) {
   var b = this;
   0 < $(this.workspace.el).find(".workspace_results.ui-selectable").length && $(this.workspace.el).find(".workspace_results").selectable("destroy");
   a = $(a.target).hasClass("row") || $(a.target).hasClass("col") ? $(a.target).find("div") : $(a.target);
   $(document);
   $.contextMenu("destroy", ".row, .col");
   $.contextMenu({
    appendTo: a,
    selector: ".row, .col",
    ignoreRightClick: !0,
    build: function(a,
     d) {
     var e = $(d.currentTarget).find("div"),
      f = $(d.currentTarget).hasClass("row") ? "ROWS" : "COLUMNS",
      g = e.attr("rel").split(":"),
      h = parseInt(g[0]),
      g = parseInt(g[1]),
      k = b.workspace.query.result.lastresult().cellset[h][g],
      h = b.workspace.query;
     h.get("schema");
     h.get("connection");
     h.get("catalog");
     h.get("cube");
     var l = k.properties.dimension,
      m = k.properties.hierarchy,
      n = k.properties.level,
      s = "",
      q = JSON.stringify({
       hierarchy: m,
       uniquename: n,
       type: "level",
       action: "delete"
      }) + "," + JSON.stringify({
       hierarchy: m,
       uniquename: k.properties.uniquename,
       type: "member",
       action: "add"
      }),
      h = k.properties.uniquename,
      t = {},
      g = b.workspace.selected_cube,
      u;
     Saiku.session.sessionworkspace.cube[g] && u && measures || ("undefined" !== typeof localStorage && localStorage && null !== localStorage.getItem("cube." + g) ? Saiku.session.sessionworkspace.cube[g] = new Cube(JSON.parse(localStorage.getItem("cube." + g))) : (Saiku.session.sessionworkspace.cube[g] = new Cube({
      key: g
     }), Saiku.session.sessionworkspace.cube[g].fetch({
      async: !1
     })), u = Saiku.session.sessionworkspace.cube[g].get("data").dimensions);
     var z = [],
      g = b.workspace.query.helper.getHierarchy(m);
     _.each(g.levels, function(a) {
      z.push(m + ".[" + a.name + "]")
     });
     _.each(u, function(a) {
      a.name == l && _.each(a.hierarchies, function(a) {
       a.uniqueName == m && _.each(a.levels, function(a) {
        t[a.name] = {
         name: a.caption,
         payload: JSON.stringify({
          hierarchy: m,
          uniquename: a.uniqueName,
          type: "level",
          action: "add"
         })
        }; - 1 < _.indexOf(z, a.uniqueName) && (t[a.name].disabled = !0, t["remove-" + a.name] = {
         name: a.caption,
         payload: JSON.stringify({
          hierarchy: m,
          uniquename: a.uniqueName,
          type: "level",
          action: "delete"
         })
        });
        a.uniqueName == n && (s = a.caption, l_name = a.name);
        t["keep-" + a.name] = t[a.name];
        t["include-" + a.name] = JSON.parse(JSON.stringify(t[a.name]));
        t["keep-" + a.name].payload = q + "," + t[a.name].payload
       })
      })
     });
     t.keeponly = {
      payload: q
     };
     t.getchildren = {
      payload: h
     };
     t.hasOwnProperty("remove-" + l_name) && t.hasOwnProperty("include-" + l_name) && (t.showall = {
      payload: t["remove-" + l_name].payload + ", " + t["include-" + l_name].payload
     });
     u = function(a) {
      var b = {},
       c;
      for (c in t) null !== a && a.length < c.length && c.substr(0, a.length) == a && (b[c] = t[c]);
      return b
     };
     h = {
      name: {
       name: "\x3cb\x3e" + e.html() + "\x3c/b\x3e",
       disabled: !0
      },
      sep1: "---------",
      keeponly: {
       name: "Keep Only",
       i18n: !0,
       payload: q
      }
     };
     "Measures" != l && (h.fold1key = {
      name: "Include Level",
      i18n: !0,
      items: u("include-")
     }, h.fold2key = {
      name: "Keep and Include Level",
      i18n: !0,
      items: u("keep-")
     }, h.fold3key = {
      name: "Remove Level",
      i18n: !0,
      items: u("remove-")
     }, h.filterlevel = {
      name: "Filter Level",
      i18n: !0
     });
     $.each(h, function(a, b) {
      recursive_menu_translate(b, Saiku.i18n.po_file)
     });
     return {
      callback: function(a, c) {
       var d = [];
       if ("keeponly" ===
        a) {
        var g = b.workspace.query.helper.getHierarchy(m);
        g && g.levels.hasOwnProperty(s) && (d.push({
         uniqueName: k.properties.uniquename,
         caption: k.properties.uniquename
        }), g.levels[s].selection = {
         type: "INCLUSION",
         members: d
        }, b.workspace.drop_zones.synchronize_query(), b.workspace.query.run(!0))
       } else if ("filterlevel" === a) d = k.properties.level.substring(k.properties.level.lastIndexOf(".") + 1), d = d.replace("[", "").replace("]", ""), (new SelectionsModal({
        target: e,
        name: "Filter Level",
        key: k.properties.hierarchy + "/" + d,
        workspace: b.workspace,
        axis: "ROWS"
       })).open();
       else if ("remove" === a.substring(0, a.indexOf("-"))) {
        var h = a.substring(a.indexOf("-") + 1);
        b.workspace.query.helper.removeLevel(m, h);
        b.workspace.drop_zones.synchronize_query();
        b.workspace.query.run(!0)
       } else "keep" === a.substring(0, a.indexOf("-")) ? (h = a.substring(a.indexOf("-") + 1), (g = b.workspace.query.helper.getHierarchy(m)) && g.levels.hasOwnProperty(s) && (d.push({
        uniqueName: k.properties.uniquename,
        caption: k.properties.uniquename
       }), g.levels[s].selection = {
        type: "INCLUSION",
        members: d
       }, b.workspace.query.helper.includeLevel(f,
        m, h, null), b.workspace.drop_zones.synchronize_query(), b.workspace.query.run(!0))) : "include" === a.substring(0, a.indexOf("-")) && (h = a.substring(a.indexOf("-") + 1), b.workspace.query.helper.includeLevel(f, m, h, null), b.workspace.drop_zones.synchronize_query(), b.workspace.query.run(!0))
      },
      items: h
     }
    }
   });
   a.contextMenu()
  },
  render: function(a, b) {
   "undefined" == typeof a || "undefined" == typeof a.data || $(this.workspace.el).is(":visible") && !$(this.el).is(":visible") || null !== a.data && null !== a.data.error || null === a.data || a.data.height &&
    0 === a.data.height || (this.clearOut(), $(this.el).html("Rendering " + a.data.width + " columns and " + a.data.height + " rows..."), _.delay(this.process_data, 2, a.data))
  },
  clearOut: function() {
   this.renderer.clear();
   $(this.workspace.el).find(".workspace_results").unbind("scroll");
   var a = document.getElementById(this.id);
   null == a && (this.workspace.tab.select(), a = document.getElementById(this.id));
   var b = a.firstChild;
   b && a.removeChild(b)
  },
  process_data: function(a) {
   this.workspace.processing.hide();
   this.workspace.adjust();
   this.clearOut();
   $(this.el).html("\x3ctable\x3e\x3c/table\x3e");
   this.renderer.render(a, {
    htmlObject: $(this.el).find("table"),
    batch: Settings.TABLE_LAZY,
    batchSize: Settings.TABLE_LAZY_SIZE,
    batchIntervalSize: Settings.TABLE_LAZY_LOAD_ITEMS,
    batchIntervalTime: Settings.TABLE_LAZY_LOAD_TIME
   });
   this.post_process()
  },
  post_process: function() {
   "QM" == this.workspace.query.get("type") && "view" != Settings.MODE ? $(this.el).addClass("headerhighlight") : $(this.el).removeClass("headerhighlight");
   $(this.el).find(".i18n").i18n(Saiku.i18n.po_file);
   this.workspace.trigger("table:rendered", this)
  }
 }),
 Workspace = Backbone.View.extend({
  className: "tab_container",
  events: {
   "click .sidebar_separator": "toggle_sidebar",
   "change .cubes": "new_query",
   "drop .sidebar": "remove_dimension",
   "drop .workspace_results": "remove_dimension",
   "click .refresh_cubes": "refresh",
   "click .cancel": "cancel",
   "click .admin": "admin"
  },
  initialize: function(a) {
   _.bindAll(this, "caption", "adjust", "toggle_sidebar", "prepare", "new_query", "set_class_charteditor", "init_query", "update_caption", "populate_selections",
    "refresh", "sync_query", "cancel", "cancelled", "no_results", "error", "switch_view_state");
   _.extend(this, Backbone.Events);
   this.loaded = !1;
   this.bind("query:result", this.render_result);
   this.toolbar = new WorkspaceToolbar({
    workspace: this
   });
   this.toolbar.render();
   this.upgrade = new Upgrade({
    workspace: this
   });
   this.upgrade.render();
   this.querytoolbar = new QueryToolbar({
    workspace: this
   });
   this.querytoolbar.render();
   this.drop_zones = new WorkspaceDropZone({
    workspace: this
   });
   this.drop_zones.render();
   this.table = new Table({
    workspace: this
   });
   this.chart = new Chart({
    workspace: this
   });
   this.dateFilter = new DateFilterCollection;
   this.item = {};
   this.viewState = a && a.viewState ? a.viewState : Settings.DEFAULT_VIEW_STATE;
   this.isReadOnly = "view" == Settings.MODE || !1;
   a && a.item && (this.item = a.item) && this.item.hasOwnProperty("acl") && 0 > _.indexOf(this.item.acl, "WRITE") && (this.isReadOnly = !0, this.viewState = "view");
   a && (a.query || a.viewState) || (this.viewState = "edit");
   a && a.query && (this.query = a.query, this.query.workspace = this, this.query.save({}, {
    success: this.init_query,
    error: function() {
     Saiku.ui.unblock();
     if (1 > $("body").find(".error_loading_query").length) {
      var a = Saiku.i18n && Saiku.i18n.po_file.error_loading_query ? Saiku.i18n.po_file.error_loading_query : null;
      a || ($('\x3cspan class\x3d"i18n error_loading_query"\x3eError Loading Query\x3c/span\x3e').hide().appendTo("body"), Saiku.i18n.translate(), a = $(".error_loading_query").text())
     } else a = $(".error_loading_query").text();
     alert(a)
    }
   }));
   Saiku.session.bind("tab:add", this.prepare);
   var b = Saiku.URLParams.paramsURI();
   void 0 != a &&
    void 0 != a.processURI && 0 == a.processURI && (b = {});
   Saiku.URLParams.equals({
    schema: b.schema,
    cube: b.cube
   });
   this.data_connections(b)
  },
  afterRender: function() {
   console.log("After render")
  },
  caption: function(a) {
   if (this.query && this.query.model) {
    if (this.item && this.item.name) return this.item.name.split(".")[0];
    if (this.query.model.mdx) return this.query.model.name
   } else if (this.query && this.query.get("name")) return this.query.get("name");
   a && Saiku.tabs.queryCount++;
   return "\x3cspan class\x3d'i18n'\x3eUnsaved query\x3c/span\x3e (" +
    Saiku.tabs.queryCount + ")"
  },
  selected_cube_template: function(a) {
   var b = Saiku.session.sessionworkspace;
   b.selected = a;
   return _.template('\x3cselect class\x3d"cubes"\x3e\x3coption value\x3d"" class\x3d"i18n"\x3eSelect a cube\x3c/option\x3e\x3c% _.each(connections, function(connection) { %\x3e\x3c% _.each(connection.catalogs, function(catalog) { %\x3e\x3c% _.each(catalog.schemas, function(schema) { %\x3e\x3c% if (schema.cubes.length \x3e 0) { %\x3e\x3coptgroup label\x3d"\x3c%\x3d (schema.name !\x3d\x3d "" ? schema.name : catalog.name) %\x3e \x3c%\x3d (connection.name) %\x3e"\x3e\x3c% _.each(schema.cubes, function(cube) { %\x3e\x3c% if ((typeof cube["visible"] \x3d\x3d\x3d "undefined" || cube["visible"]) \x26\x26 selected !\x3d\x3d cube.caption) { %\x3e\x3coption value\x3d"\x3c%\x3d connection.name %\x3e/\x3c%\x3d catalog.name %\x3e/\x3c%\x3d ((schema.name \x3d\x3d\x3d "" || schema.name \x3d\x3d\x3d null) ? "null" : schema.name) %\x3e/\x3c%\x3d encodeURIComponent(cube.name) %\x3e"\x3e\x3c%\x3d ((cube.caption \x3d\x3d\x3d "" || cube.caption \x3d\x3d\x3d null) ? cube.name : cube.caption) %\x3e\x3c/option\x3e\x3c% } else if ((typeof cube["visible"] \x3d\x3d\x3d "undefined" || cube["visible"]) \x26\x26 selected \x3d\x3d\x3d cube.caption) { %\x3e\x3coption value\x3d"\x3c%\x3d connection.name %\x3e/\x3c%\x3d catalog.name %\x3e/\x3c%\x3d ((schema.name \x3d\x3d\x3d "" || schema.name \x3d\x3d\x3d null) ? "null" : schema.name) %\x3e/\x3c%\x3d encodeURIComponent(cube.name) %\x3e" selected\x3e\x3c%\x3d ((cube.caption \x3d\x3d\x3d "" || cube.caption \x3d\x3d\x3d null) ? cube.name : cube.caption) %\x3e\x3c/option\x3e\x3c% } %\x3e\x3c% }); %\x3e\x3c/optgroup\x3e\x3c% } %\x3e\x3c% }); %\x3e\x3c% }); %\x3e\x3c% }); %\x3e\x3c/select\x3e')(b)
  },
  template: function() {
   var a = $("#template-workspace").html() || "",
    b = !1;
   this.isUrlCubeNavigation && (b = this.selected_cube.split("/")[3], b = this.selected_cube_template(b));
   return _.template(a)({
    cube_navigation: b ? b : Saiku.session.sessionworkspace.cube_navigation
   })
  },
  refresh: function(a) {
   a && a.preventDefault();
   Saiku.session.sessionworkspace.refresh()
  },
  render: function() {
   $(this.el).html(this.template());
   this.processing = $(this.el).find(".query_processing");
   this.isReadOnly || Settings.MODE && ("view" == Settings.MODE || "table" ==
    Settings.MODE || "map" == Settings.MODE || "chart" == Settings.MODE) ? ($(this.el).find(".workspace_editor").remove(), this.toggle_sidebar(), $(this.el).find(".sidebar_separator").remove(), $(this.el).find(".workspace_inner").css({
    "margin-left": 0
   }), $(this.el).find(".workspace_fields").remove(), $(this.el).find(".sidebar").hide(), $(this.toolbar.el).find(".run, .auto, .toggle_fields, .toggle_sidebar,.switch_to_mdx, .new").parent().remove()) : ($(this.el).find(".workspace_editor").append($(this.drop_zones.el)), $(this.el).find(".sidebar").droppable({
     accept: ".d_measure, .selection"
    }),
    $(this.el).find(".workspace_results").droppable({
     accept: ".d_measure, .selection"
    }));
   !Settings.MODE || "table" != Settings.MODE && "chart" != Settings.MODE && "map" != Settings.MODE ? ($(this.el).find(".workspace_toolbar").append($(this.toolbar.el)), $(this.el).find(".query_toolbar").append($(this.querytoolbar.el)), $(this.el).find(".upgrade").append($(this.upgrade.el))) : ($(this.el).find(".workspace_toolbar").remove(), $(this.el).find(".query_toolbar").remove());
   this.switch_view_state(this.viewState, !0);
   $(this.el).find(".workspace_results").append($(this.table.el));
   this.chart.render_view();
   this.tab.bind("tab:select", this.adjust);
   $(window).resize(this.adjust);
   Saiku.session.trigger("workspace:new", {
    workspace: this
   });
   if (Settings.PLUGIN && 0 == Settings.BIPLUGIN5 && Saiku.session.isAdmin) {
    var a = $("\x3ca /\x3e").attr({
     href: "#adminconsole",
     title: "Admin Console"
    }).click(Saiku.AdminConsole.show_admin).addClass("button admin_console");
    $(this.el).find(".refresh_cubes_nav").css("margin-right", "40px");
    $(this.el).find(".admin_console_nav").append(a)
   }
   Saiku.session.isAdmin || $(this.el).find(".refresh_cubes_nav").hide();
   return this
  },
  clear: function() {
   this.table.clearOut();
   $(this.el).find(".workspace_results table,.connectable").html("");
   $(this.el).find(".workspace_results_info").empty();
   $(this.el).find(".parameter_input").empty();
   $(this.chart.el).find("div.canvas").empty();
   $(this.querytoolbar.el).find("ul.options a.on").removeClass("on");
   $(this.el).find('.fields_list[title\x3d"ROWS"] .limit').removeClass("on");
   $(this.el).find('.fields_list[title\x3d"COLUMNS"] .limit').removeClass("on");
   Saiku.session.trigger("workspace:clear", {
    workspace: this
   })
  },
  adjust: function() {
   var a = $(this.el).find(".sidebar_separator"),
    b = 87;
   if (!0 === Settings.PLUGIN || !0 === Settings.BIPLUGIN) b = 2, "table" == Settings.MODE && (b = -5);
   if (0 === $("#header").length || $("#header").is("hidden")) b = 2;
   a.height($("body").height() - b);
   $(this.el).find(".sidebar").height($("body").height() - b);
   $(this.querytoolbar.el).find("div").height($("body").height() - b - 10);
   var a = $(this.el).find(".workspace_editor").is(":hidden") ? 0 : $(this.el).find(".workspace_editor").height(),
    c = $(this.el).find(".query_processing").is(":hidden") ?
    0 : $(this.el).find(".query_processing").height() + 62,
    d = $(this.el).find(".upgradeheader").is(":hidden") ? 0 : $(this.el).find(".upgrade").height();
   $(this.el).find(".workspace_results").css({
    height: $("body").height() - b - $(this.el).find(".workspace_toolbar").height() - $(this.el).find(".workspace_results_info").height() - a - c - d - 20
   });
   this.querytoolbar && $(this.querytoolbar.el).find("a").tipsy({
    delayIn: 700,
    fade: !0
   });
   this.toolbar && $(this.toolbar.el).find("a").tipsy({
    delayIn: 900,
    fade: !0
   });
   $(this.el).find(".workspace_fields").css({
    height: $("body").height() -
     b - $(this.el).find(".workspace_toolbar").height() - d - 20
   });
   this.trigger("workspace:adjust", {
    workspace: this
   })
  },
  toggle_sidebar: function() {
   $(this.el).find(".sidebar").toggleClass("hide");
   $(this.toolbar.el).find(".toggle_sidebar").toggleClass("on");
   var a = ($(this.el).find(".sidebar").is(":visible") ? $(this.el).find(".sidebar").width() : 0) + $(this.el).find(".sidebar_separator").width() + 1;
   $(this.el).find(".workspace_inner").css({
    "margin-left": a
   })
  },
  prepare: function() {},
  setDefaultFilters: function(a, b) {
   _.each(a,
    function(a) {
     var d = a.filtername,
      e = d.substring(0, d.lastIndexOf("[") - 1),
      d = d.substring(d.lastIndexOf("["));
     b.helper.setDefaultFilter(e, d, a.filtervalue)
    })
  },
  data_connections: function(a) {
   var b = this;
   _.each(Saiku.session.sessionworkspace.connections, function(c) {
    _.each(c.catalogs, function(d) {
     _.each(d.schemas, function(e) {
      0 < e.cubes.length && _.each(e.cubes, function(f) {
       if ("undefined" === typeof f.visible || f.visible) {
        var g = "" === e.name || null === e.name ? "null" : e.name;
        f = "" === f.caption || null === f.caption ? f.name : f.caption;
        a.schema === g && a.cube === f && (b.selected_cube = c.name + "/" + d.name + "/" + g + "/" + f, b.isUrlCubeNavigation = !0, b.paramsURI = a, _.delay(b.new_query, 1E3))
       }
      })
     })
    })
   })
  },
  create_new_query: function(a) {
   a.query && (a.query.destroy(), a.query.clear(), a.query.name && (a.query.name = void 0, a.update_caption(!0)), a.query.name = void 0);
   a.clear();
   a.processing.hide();
   Saiku.session.trigger("workspace:clear", {
    workspace: a
   });
   a.selected_cube = $(a.el).find(".cubes").val() ? $(a.el).find(".cubes").val() : a.selected_cube;
   if (!a.selected_cube) return $(a.el).find(".calculated_measures, .addMeasure").hide(),
    $(a.el).find(".dimension_tree").html(""), $(a.el).find(".measure_tree").html(""), !1;
   a.metadata = Saiku.session.sessionworkspace.cube[a.selected_cube];
   for (var b = a.selected_cube.split("/"), c = b[3], d = 4, e = b.length; d < e; d++) c += "/" + b[d];
   Saiku.events.trigger("workspace:new_query", this, {
    view: this,
    cube: c
   });
   this.query = new Query({
    cube: {
     connection: b[0],
     catalog: b[1],
     schema: "null" == b[2] ? "" : b[2],
     name: decodeURIComponent(c)
    }
   }, {
    workspace: a
   });
   a.query = this.query;
   a.query.save({}, {
    data: {
     json: JSON.stringify(this.query.model)
    },
    async: !1
   });
   a.init_query()
  },
  extractDefaultFilters: function(a) {
   var b = [],
    c, d;
   for (d in a)
    if (-1 < d.indexOf("default_filter_")) {
     var e = d.replace("default_filter_", "");
     c = a[d];
     b.push({
      filtername: e,
      filtervalue: c
     })
    }
   return b
  },
  new_query: function() {
   this.query ? Settings.QUERY_OVERWRITE_WARNING ? (new WarningModal({
    title: "New Query",
    message: "You are about to clear your existing query",
    okay: this.create_new_query,
    okayobj: this
   })).render().open() : this.create_new_query(this) : this.create_new_query(this)
  },
  init_query: function(a) {
   var b =
    this;
   try {
    var c = this.query.model.properties ? this.query.model.properties : {},
     d = "RENDER_MODE" in Settings ? Settings.RENDER_MODE : "saiku.ui.render.mode" in c ? c["saiku.ui.render.mode"] : null,
     e = "RENDER_TYPE" in Settings ? Settings.RENDER_TYPE : "saiku.ui.render.type" in c ? c["saiku.ui.render.type"] : null;
    "table" == Settings.MODE ? d = "table" : "chart" == Settings.MODE ? d = "chart" : "map" == Settings.MODE && (d = "map");
    "undefined" != typeof d && null !== d && this.querytoolbar.switch_render(d);
    "chart" == d ? (!Settings.MODE || "chart" !== Settings.MODE ||
     "map_heat" !== e && "map_geo" !== e && "map_marker" !== e || (this.query.setProperty("saiku.ui.render.mode", "chart"), e = "stackedBar"), $(this.chart.el).find(".canvas_wrapper").hide(), this.chart.renderer.switch_chart(e), $(this.querytoolbar.el).find('ul.chart [href\x3d"#' + e + '"]').parent().siblings().find(".on").removeClass("on"), $(this.querytoolbar.el).find('ul.chart [href\x3d"#' + e + '"]').addClass("on"), this.set_class_charteditor()) : "table" == d && e in this.querytoolbar ? (this.querytoolbar.render_mode = "table", this.querytoolbar.spark_mode =
     e, $(this.querytoolbar.el).find("ul.table a." + e).addClass("on")) : "map" === d && (this.querytoolbar.$el.find("ul.chart \x3e li").find("a").removeClass("on"), this.querytoolbar.$el.find('ul.chart [href\x3d"#' + d + '"]').addClass("on"))
   } catch (f) {
    Saiku.error(this.cid, f)
   }
   "table" == Settings.MODE && this.query ? this.query.run(!0) : ("MDX" == this.query.model.type ? (this.query.setProperty("saiku.olap.result.formatter", "flat"), $(this.el).find(".sidebar").hasClass("hide") || this.toggle_sidebar(), $(this.el).find(".workspace_fields").addClass("hide"),
    this.toolbar.switch_to_mdx()) : ($(this.el).find(".workspace_editor").removeClass("hide").show(), $(this.el).find(".workspace_fields").removeClass("disabled").removeClass("hide"), $(this.el).find(".workspace_editor .mdx_input").addClass("hide"), $(this.el).find(".workspace_editor .editor_info").addClass("hide"), $(this.toolbar.el).find(".auto, .toggle_fields, .query_scenario, .buckets, .non_empty, .swap_axis, .mdx, .switch_to_mdx, .zoom_mode, .drillacross").parent().show(), $(this.el).find(".run").attr("href",
    "#run_query")), this.adjust(), this.switch_view_state(this.viewState, !0), $(this.el).find(".sidebar").hasClass("hide") || "chart" != Settings.MODE && "table" != Settings.MODE && "map" != Settings.MODE && "view" != Settings.MODE && !this.isReadOnly || this.toggle_sidebar(), "view" == Settings.MODE && this.query || this.isReadOnly ? (this.query.run(!0), void 0 === this.selected_cube && (c = this.query.model.cube.schema, this.selected_cube = this.query.model.cube.connection + "/" + this.query.model.cube.catalog + "/" + ("" === c || null === c ? "null" : c) + "/" +
    encodeURIComponent(this.query.model.cube.name), $(this.el).find(".cubes").val(this.selected_cube))) : (void 0 === this.selected_cube && (c = this.query.model.cube.schema, this.selected_cube = this.query.model.cube.connection + "/" + this.query.model.cube.catalog + "/" + ("" === c || null === c ? "null" : c) + "/" + encodeURIComponent(this.query.model.cube.name), $(this.el).find(".cubes").val(this.selected_cube)), this.selected_cube ? (c = Saiku.session.sessionworkspace.cube[this.selected_cube], this.dimension_list = new DimensionList({
    workspace: this,
    cube: c
   }), this.dimension_list.render(), $(this.el).find(".metadata_attribute_wrapper").html("").append($(this.dimension_list.el)), c.has("data") || c.fetch({
    success: function() {
     b.trigger("cube:loaded")
    }
   }), this.trigger("query:new", {
    workspace: this
   })) : ($(this.el).find(".calculated_measures, .addMeasure").hide(), $(this.el).find(".dimension_tree").html(""), $(this.el).find(".measure_tree").html("")), "undefined" != typeof a && this.query.run(!0), Saiku.i18n.translate()))
  },
  set_class_charteditor: function() {
   this.query.getProperty("saiku.ui.chart.options") &&
    $(this.querytoolbar.el).find('ul.chart [href\x3d"#charteditor"]').addClass("on")
  },
  synchronize_query: function() {
   this.isReadOnly || Settings.hasOwnProperty("MODE")
  },
  sync_query: function(a) {
   if ("QUERYMODEL" === this.query.helper.model().type && (a = a ? a : $(this.dimension_list.el), !this.isReadOnly && (!Settings.hasOwnProperty("MODE") || "table" != Settings.MODE && "view" != Settings.MODE))) {
    a.find(".selected").removeClass("selected");
    var b = this.query.helper.getCalculatedMeasures();
    b && 0 < b.length ? (b = _.template($("#template-calculated-measures").html(), {
     measures: b
    }), a.find(".calculated_measures").html(b), a.find(".calculated_measures").find(".measure").parent("li").draggable({
     cancel: ".not-draggable",
     connectToSortable: $(this.el).find(".fields_list_body.details ul.connectable"),
     helper: "clone",
     placeholder: "placeholder",
     opacity: .6,
     tolerance: "touch",
     containment: $(this.el),
     cursorAt: {
      top: 10,
      left: 35
     }
    })) : a.find(".calculated_measures").empty();
    this.drop_zones.synchronize_query()
   }
   Saiku.i18n.translate()
  },
  populate_selections: function(a) {
   console.log("populate_selections");
   a.workspace.sync_query();
   return !1
  },
  update_caption: function(a) {
   a = this.caption(a);
   this.tab.set_caption(a)
  },
  remove_dimension: function(a, b) {
   "QUERYMODEL" == this.query.model.type && this.drop_zones.remove_dimension(a, b)
  },
  update_parameters: function() {
   var a = this;
   $(this.el).find(".parameter_input").html("");
   if (a.hasOwnProperty("query") && Settings.ALLOW_PARAMETERS && "view" !== Settings.MODE && "view" !== a.viewState) {
    var b = "\x3cspan class\x3d'i18n'\x3eParameters\x3c/span\x3e: ",
     c = this.query.helper.model().parameters,
     d = !1,
     e;
    for (e in c) {
     var f = "",
      g;
     c[e] && null !== c[e] && (f = c[e], g = c[e].split(","));
     void 0 != f && "" != f && (f += ",");
     d = this.query.helper.getSelectionsForParameter(e);
     _.each(d, function(a) {
      -1 < $.inArray(a.name, g) || (f = f + a.name + ",")
     });
     var f = f.substr(0, f.lastIndexOf(",")),
      b = b + ("\x3cb\x3e" + e + "\x3c/b\x3e \x3cinput type\x3d'text' placeholder\x3d'" + e + "' value\x3d'" + f + "' /\x3e"),
      d = !0,
      h = f.split(","),
      k = a.query.helper.getLevelForParameter(e);
     _.each(h, function(b) {
      void 0 != b && "" != b && a.query.helper.addtoSelection(b, k)
     })
    }
    b += "";
    d ?
     $(this.el).find(".parameter_input").html(b) : $(this.el).find(".parameter_input").html("");
    $(this.el).find(".parameter_input input").off("change");
    $(this.el).find(".parameter_input input").on("change", function(b) {
     var c = $(b.target).attr("placeholder");
     b = $(b.target).val();
     a.query.helper.model().parameters[c] = b
    })
   }
  },
  render_result: function(a) {
   $(this.el).find(".workspace_results_info").empty();
   if (null !== a.data && null !== a.data.error) return this.error(a);
   if (null === a.data || a.data.cellset && 0 === a.data.cellset.length) return this.no_results(a);
   var b = (new Date).getHours();
   10 > b && (b = "0" + b);
   var c = (new Date).getMinutes();
   10 > c && (c = "0" + c);
   b = b + ":" + c;
   c = null !== a.data.runtime ? (a.data.runtime / 1E3).toFixed(2) : "";
   b = '\x3cb\x3e\x3cspan class\x3d"i18n"\x3eInfo:\x3c/span\x3e\x3c/b\x3e \x26nbsp;' + b + "\x26emsp;/ \x26nbsp;" + a.data.width + " x " + a.data.height + "\x26nbsp; / \x26nbsp;" + c + "s";
   this.update_parameters();
   $(this.el).find(".workspace_results_info").html(b);
   a = a.workspace.query.getProperty("saiku.ui.headings");
   void 0 != a && (a = JSON.parse(a), b = "", null != a.title &&
    "" != a.title && (b = '\x3ch3\x3e\x3cspan class\x3d"i18n"\x3eTitle:\x3c/span\x3e\x3c/h3\x3e \x26nbsp;' + a.title + "\x3cbr/\x3e"), null != a.variable && "" != a.variable && (b += '\x3ch3\x3e\x3cspan class\x3d"i18n"\x3eVariable:\x3c/span\x3e\x3c/h3\x3e \x26nbsp;' + a.variable + "\x3cbr/\x3e"), null != a.explanation && "" != a.explanation && (b += '\x3ch3\x3e\x3cspan class\x3d"i18n"\x3eExplanation:\x3c/span\x3e\x3c/h3\x3e \x26nbsp;' + a.explanation), $(this.el).find(".workspace_results_titles").html(b));
   this.adjust();
   Saiku.i18n.translate()
  },
  switch_view_state: function(a, b) {
   var c = a || "edit";
   "edit" == c ? (this.toolbar.toggle_fields_action("show", b), this.query && "MDX" == this.query.get("type") && this.toolbar.editor.gotoLine(0), $(this.el).find(".sidebar").hasClass("hide") && this.toggle_sidebar(), $(this.toolbar.el).find(".auto, .toggle_fields, .toggle_sidebar,.switch_to_mdx, .new").parent().css({
    display: "block"
   })) : "view" == c && (this.toolbar.toggle_fields_action("hide", b), $(this.el).find(".sidebar").hasClass("hide") || this.toggle_sidebar(), $(this.toolbar.el).find(".auto, .toggle_fields, .toggle_sidebar,.switch_to_mdx").parent().hide());
   this.viewState = c;
   this.update_parameters();
   $(window).trigger("resize")
  },
  block: function(a) {
   Settings.LOGO_32x32 ? $(this.el).block({
    message: '\x3cimg class\x3d"saiku_logo_override" style\x3d"float:left" src\x3d"' + Settings.LOGO_32x32 + '"/\x3e ' + a
   }) : $(this.el).block({
    message: '\x3cspan class\x3d"saiku_logo" style\x3d"float:left"\x3e\x26nbsp;\x26nbsp;\x3c/span\x3e ' + a
   });
   Saiku.i18n.translate()
  },
  unblock: function() {
   isIE || $(this.el).unblock();
   Saiku.ui.unblock()
  },
  cancel: function(a) {
   var b = this;
   a && a.preventDefault();
   this.query.action.del("/cancel", {
    success: function() {
     b.cancelled()
    }
   })
  },
  admin: function(a) {
   Saiku.AdminConsole.show_admin()
  },
  cancelled: function(a) {
   this.processing.html('\x3cspan class\x3d"processing_image"\x3e\x26nbsp;\x26nbsp;\x3c/span\x3e \x3cspan class\x3d"i18n"\x3eCanceling Query...\x3c/span\x3e').show()
  },
  no_results: function(a) {
   this.processing.html('\x3cspan class\x3d"i18n"\x3eNo Results\x3c/span\x3e').show()
  },
  error: function(a) {
   this.processing.html(safe_tags_replace(a.data.error)).show()
  }
 }),
 DeleteRepositoryObject =
 Modal.extend({
  type: "delete",
  buttons: [{
   text: "Yes",
   method: "del"
  }, {
   text: "No",
   method: "close"
  }],
  initialize: function(a) {
   this.options.title = "Confirm deletion";
   this.query = a.query;
   this.success = a.success;
   this.message = '\x3cspan class\x3d"i18n"\x3eAre you sure you want to delete \x3c/span\x3e\x3cspan\x3e' + this.query.get("name") + "?\x3c/span\x3e"
  },
  del: function() {
   this.query.set("id", _.uniqueId("query_"));
   this.query.id = _.uniqueId("query_");
   this.query.url = this.query.url() + "?file\x3d" + encodeURIComponent(this.query.get("file"));
   this.query.destroy({
    success: this.success,
    dataType: "text",
    error: this.error,
    wait: !0
   });
   this.close()
  },
  error: function() {
   $(this.el).find("dialog_body").html('\x3cspan class\x3d"i18n"\x3eCould not delete repository object\x3c/span\x3e')
  }
 }),
 MoveRepositoryObject = Modal.extend({
  type: "save",
  closeText: "Move",
  events: {
   click: "select_root_folder",
   "click .dialog_footer a": "call",
   "click .query": "select_name",
   "dblclick .query": "open_query",
   "click li.folder": "toggle_folder",
   "keyup .search_file": "search_file",
   "click .cancel_search": "cancel_search",
   "click .export_btn": "export_zip",
   "change .file": "select_file"
  },
  buttons: [{
   id: "test",
   text: "Move",
   method: "open_query"
  }, {
   text: "Cancel",
   method: "close"
  }],
  initialize: function(a) {
   var b = this;
   this.movefolder = a.query;
   this.success = a.success;
   this.message = '\x3cbr/\x3e\x3cb\x3e\x3cdiv class\x3d\'query_name\'\x3e\x3cspan class\x3d\'i18n\'\x3ePlease select a folder.....\x3c/span\x3e\x3c/div\x3e\x3c/b\x3e\x3cbr/\x3e\x3cdiv class\x3d\'RepositoryObjects i18n\'\x3eLoading...\x3c/div\x3e\x3cbr\x3e\x3cdiv style\x3d"height:25px; line-height:25px;"\x3e\x3cb\x3e\x3cspan class\x3d"i18n"\x3eSearch:\x3c/span\x3e\x3c/b\x3e \x26nbsp; \x3cspan class\x3d"search"\x3e\x3cinput type\x3d"text" class\x3d"search_file"\x3e\x3c/input\x3e\x3cspan class\x3d"cancel_search"\x3e\x3c/span\x3e\x3c/span\x3e\x3c/div\x3e';
   _.extend(this.options, {
    title: "Move"
   });
   this.selected_folder = null;
   this.repository = new Repository({}, {
    dialog: this
   });
   this.bind("open", function() {
    var a = $("body").height() / 2 + $("body").height() / 6;
    420 < a && (a = 420);
    $(this.el).find(".RepositoryObjects").height(a);
    $(this.el).dialog("option", "position", "center");
    $(this.el).parents(".ui-dialog").css({
     width: "550px"
    });
    $(this.el).find(".dialog_footer").find('a[href\x3d"#open_query"]').hide();
    b.repository.fetch()
   });
   _.bindAll(this, "populate", "toggle_folder", "select_name",
    "select_file", "select_folder", "open_query")
  },
  populate: function(a) {
   function b(a) {
    _.forEach(a, function(a) {
     "FOLDER" === a.type && (c.queries[a.path] = a, b(a.repoObjects))
    })
   }
   var c = this;
   $(this.el).find(".RepositoryObjects").html(_.template($("#template-repository-objects").html())({
    repoObjects: a
   }));
   c.queries = {};
   b(a)
  },
  select_root_folder: function(a) {
   "name" !== $(a.target).attr("name") && this.unselect_current_selected_folder()
  },
  toggle_folder: function(a) {
   var b = $(a.currentTarget);
   this.unselect_current_selected_folder();
   b.children(".folder_row").addClass("selected");
   var c = b.children(".folder_content");
   b.children(".folder_row").find(".sprite").hasClass("collapsed") ? (b.children(".folder_row").find(".sprite").removeClass("collapsed"), c.removeClass("hide")) : (b.children(".folder_row").find(".sprite").addClass("collapsed"), c.addClass("hide"));
   this.select_folder();
   this.select_name(a);
   return !1
  },
  select_name: function(a) {
   a = $(a.currentTarget);
   this.unselect_current_selected_folder();
   a.parent().parent().has(".folder").children(".folder_row").addClass("selected");
   a = a.find("a").attr("href");
   a = a.replace("#", "");
   $(this.el).find(".query_name").html(a);
   $(this.el).find(".dialog_footer").find('a[href\x3d"#open_query"]').show();
   this.select_folder();
   return !1
  },
  unselect_current_selected_folder: function() {
   $(this.el).find(".selected").removeClass("selected")
  },
  select_folder: function() {
   var a = $(this.el).find(".selected"),
    a = 0 < a.length ? a.children("a").attr("href").replace("#", "") : null;
   if ("undefined" != typeof a && null !== a && "" !== a) {
    var b = $("#importForm");
    b.find(".directory").val(a);
    var c = Settings.REST_URL + (new RepositoryZipExport).url() + "upload";
    b.attr("action", c);
    $(this.el).find(".zip_folder").text(a);
    this.selected_folder = a;
    $(this.el).find(".export_btn, .import_btn").removeAttr("disabled");
    this.select_file()
   } else $(this.el).find(".import_btn, .export_btn").attr("disabled", "true")
  },
  select_file: function() {
   var a = $("#importForm").find(".file").val();
   "undefined" != typeof a && "" !== a && null !== a && null !== this.selected_folder ? $(this.el).find(".import_btn").removeAttr("disabled") : $(this.el).find(".import_btn").attr("disabled",
    "true")
  },
  open_query: function(a) {
   var b = $(a.currentTarget),
    c = $(this.el).find(".query_name").html();
   b.hasClass("query") && (c = b.find("a").attr("href").replace("#", ""));
   var d = this;
   (new MoveObject).save({
    source: this.movefolder.get("file"),
    target: c
   }, {
    success: function() {
     d.close();
     d.success()
    }
   });
   a.preventDefault();
   return !1
  }
 }),
 MoveObject = Backbone.Model.extend({
  url: function() {
   return "api/repository/resource/move"
  }
 }),
 OpenQuery = Backbone.View.extend({
  className: "tab_container",
  events: {
   "click .query": "view_query",
   "dblclick .query": "select_and_open_query",
   "click .add_folder": "add_folder",
   "click li.folder": "toggle_folder",
   "click .workspace_toolbar a.button": "prevent_default",
   "click .workspace_toolbar a.run": "open_query",
   "click .workspace_toolbar a.edit": "edit_query",
   "click .workspace_toolbar [href\x3d#edit_folder]": "edit_folder",
   "click .workspace_toolbar [href\x3d#delete_folder]": "delete_repoObject",
   "click .workspace_toolbar [href\x3d#delete_query]": "delete_repoObject",
   "click .workspace_toolbar [href\x3d#edit_permissions]": "edit_permissions",
   "click .queries": "click_canvas",
   "keyup .search_file": "search_file",
   "click .cancel_search": "cancel_search"
  },
  template: function() {
   return _.template($("#template-open-dialog").html())()
  },
  template_repository_objects: function(a) {
   $(this.el).find(".sidebar ul").html(_.template($("#template-repository-objects").html())({
    repoObjects: a
   }))
  },
  caption: function() {
   return '\x3cspan class\x3d"i18n"\x3eRepository\x3c/span\x3e'
  },
  render: function() {
   $(this.el).html(this.template());
   this.tab.bind("tab:select", this.fetch_queries);
   this.tab.bind("tab:select", this.adjust);
   $(window).resize(this.adjust);
   var a = this,
    b = {
     open: {
      name: "Open",
      i18n: !0
     },
     edit: {
      name: "Edit",
      i18n: !0
     },
     "delete": {
      name: "Delete",
      i18n: !0
     },
     move: {
      name: "Move",
      i18n: !0
     },
     sep1: "---------",
     "new": {
      name: "New Folder",
      i18n: !0
     },
     opencontents: {
      name: "Open Folder Contents",
      i18n: !0
     }
    };
   $.each(b, function(a, b) {
    recursive_menu_translate(b, Saiku.i18n.po_file)
   });
   $.contextMenu("destroy", "li.query, div.folder_row");
   $.contextMenu({
    selector: "li.query, div.folder_row",
    events: {
     show: function(b) {
      $(a.el).find(".selected").removeClass("selected");
      $(this).addClass("selected");
      var d = $(this).find("a").attr("href").replace("#", ""),
       d = a.queries[d];
      "undefined" != typeof d.acl && 0 > _.indexOf(d.acl, "WRITE") ? (b.commands["delete"].disabled = !0, b.items["delete"].disabled = !0, b.commands.edit.disabled = !0, b.items.edit.disabled = !0, b.commands.move.disabled = !0, b.items.move.disabled = !0) : (b.commands["delete"].disabled = !1, b.items["delete"].disabled = !1, b.commands.edit.disabled = !1, b.items.edit.disabled = !1, b.commands.move.disabled = !1, b.items.move.disabled = !1);
      $(this).hasClass("folder_row") ?
       (b.commands.open.disabled = !0, b.items.open.disabled = !0) : (b.commands.open.disabled = !1, b.items.open.disabled = !1)
     }
    },
    callback: function(b, d) {
     var e = $(this).find("a").attr("href").replace("#", ""),
      f = a.queries[e];
     a.selected_query = new SavedQuery({
      file: e,
      name: f.name,
      type: f.type
     });
     "open" == b && $(this).hasClass("query") && a.open_query();
     "edit" == b && $(this).hasClass("query") ? a.edit_query() : "new" == b ? a.add_folder() : "delete" == b ? a.delete_repoObject() : "move" == b ? a.move_repoObject() : "opencontents" == b && a.open_contents()
    },
    items: b
   });
   Saiku.session.trigger("openQuery:new", {
    openQuery: this
   });
   Settings.REPOSITORY_LAZY && this.$el.find(".search_file").prop("disabled", !0);
   return this
  },
  initialize: function(a) {
   _.bindAll(this, "adjust", "fetch_queries", "clear_query", "select_and_open_query", "cancel_search", "add_folder");
   this.repository = new Repository({}, {
    dialog: this
   })
  },
  fetch_queries: function() {
   this.repository.fetch()
  },
  populate: function(a) {
   function b(a) {
    _.forEach(a, function(a) {
     c.queries[a.path] = a;
     "FOLDER" === a.type && b(a.repoObjects)
    })
   }
   var c = this;
   c.template_repository_objects(a);
   c.queries = {};
   b(a)
  },
  search_file: function(a) {
   var b = $(this.el).find(".search_file").val().toLowerCase();
   "undefined" == typeof b || "" === b || null === b || 27 == a.which || 9 == a.which ? this.cancel_search() : ($(this.el).find(".search_file").val() ? $(this.el).find(".cancel_search").show() : $(this.el).find(".cancel_search").hide(), $(this.el).find("li.query").removeClass("hide"), $(this.el).find("li.query a").each(function(a) {
     -1 == $(this).text().toLowerCase().indexOf(b) && $(this).parent("li.query").addClass("hide")
    }),
    $(this.el).find("li.folder").addClass("hide"), $(this.el).find("li.query").not(".hide").parents("li.folder").removeClass("hide"), $(this.el).find("li.folder .folder_row").find(".sprite").removeClass("collapsed"), $(this.el).find("li.folder .folder_content").removeClass("hide"));
   return !1
  },
  cancel_search: function(a) {
   $(this.el).find("input.search_file").val("");
   $(this.el).find(".cancel_search").hide();
   $(this.el).find("li.query, li.folder").removeClass("hide");
   $(this.el).find(".folder_row").find(".sprite").addClass("collapsed");
   $(this.el).find("li.folder .folder_content").addClass("hide");
   $(this.el).find(".search_file").val("").focus();
   $(this.el).find(".cancel_search").hide()
  },
  view_query: function(a) {
   a.preventDefault();
   a = $(a.currentTarget);
   var b = a.find("a");
   this.unselect_current_selected();
   a.addClass("selected");
   a = b.attr("href").replace("#", "");
   var b = b.text(),
    c = this.queries[a];
   $(this.el).find(".workspace_toolbar").removeClass("hide");
   $(this.el).find(".for_queries").addClass("hide");
   $(this.el).find(".for_folder").addClass("hide");
   $(this.el).find(".add_folder").parent().addClass("hide");
   "undefined" != typeof c.acl && -1 < _.indexOf(c.acl, "READ") && $(this.el).find(".for_queries .run").parent().removeClass("hide");
   "undefined" != typeof c.acl && -1 < _.indexOf(c.acl, "WRITE") && ($(this.el).find(".for_queries .delete").parent().removeClass("hide"), $(this.el).find(".for_queries .edit").parent().removeClass("hide"));
   "undefined" != typeof c.acl && -1 < _.indexOf(c.acl, "GRANT") && $(this.el).find(".for_queries .edit_permissions").parent().removeClass("hide");
   try {
    var d = a.split("/");
    if (1 < d.length) {
     var e = d.splice(0, d.length - 1).join("/"),
      f = this.queries[e];
     "undefined" != typeof f.acl && -1 < _.indexOf(f.acl, "WRITE") && $(this.el).find(".add_folder").parent().removeClass("hide")
    } else 1 == d.length && $(this.el).find(".add_folder").parent().removeClass("hide")
   } catch (g) {}
   var d = $(this.el).find(".workspace_results").html("\x3ch3\x3e\x3cstrong\x3e" + c.name + "\x3c/strong\x3e\x3c/h3\x3e"),
    d = $('\x3cul id\x3d"query_info" /\x3e').appendTo(d),
    h;
   for (h in c) c.hasOwnProperty(h) && "name" !=
    h && d.append($("\x3cli /\x3e").html("\x3cstrong\x3e" + h + "\x3c/strong\x3e : " + c[h]));
   this.selected_query = new SavedQuery({
    file: a,
    name: b,
    type: c.type
   });
   return !1
  },
  view_folder: function(a) {
   var b = $(a.currentTarget).children("div").children("a");
   a = b.attr("href").replace("#", "");
   var b = b.text(),
    c = this.queries[a];
   $(this.el).find(".workspace_toolbar").removeClass("hide");
   $(this.el).find(".add_folder").parent().addClass("hide");
   $(this.el).find(".for_queries").addClass("hide");
   $(this.el).find(".for_folder").addClass("hide");
   "undefined" != typeof c.acl && -1 < _.indexOf(c.acl, "WRITE") && ($(this.el).find(".for_folder .delete").parent().removeClass("hide"), $(this.el).find(".add_folder").parent().removeClass("hide"));
   "undefined" != typeof c.acl && -1 < _.indexOf(c.acl, "GRANT") && $(this.el).find(".for_folder .edit_permissions").parent().removeClass("hide");
   $(this.el).find(".workspace_results").html("\x3ch3\x3e\x3cstrong\x3e" + b + "\x3c/strong\x3e\x3c/h3\x3e");
   this.selected_query = new SavedQuery({
    file: a,
    name: b,
    type: c.type
   })
  },
  prevent_default: function(a) {
   a.preventDefault();
   return !1
  },
  add_folder: function(a) {
   $selected = $(this.el).find(".selected");
   a = "";
   if ("undefined" !== typeof $selected && $selected)
    if ($selected.hasClass("folder_row")) a = $selected.children("a").attr("href"), a = 1 < a.length ? a.substring(1, a.length) : a, a += "/";
    else if ($selected.hasClass("query") && !$selected.parent().hasClass("RepositoryObjects")) {
    var b = $selected.find("a");
    a = b.attr("href");
    b = b.text();
    a = a.substring(1, a.length - b.length)
   }(new AddFolderModal({
    path: a,
    success: this.clear_query
   })).render().open();
   return !1
  },
  click_canvas: function(a) {
   $(a.currentTarget).hasClass("sidebar") && $(this.el).find(".selected").removeClass("selected");
   $(this.el).find(".add_folder").parent().removeClass("hide");
   return !1
  },
  toggle_folder: function(a) {
   var b = $(a.currentTarget),
    c = b.children(".folder_row").find("a").attr("href"),
    c = c.replace("#", "");
   this.unselect_current_selected();
   b.children(".folder_row").addClass("selected");
   var d = b.children(".folder_content");
   b.children(".folder_row").find(".sprite").hasClass("collapsed") ? (b.children(".folder_row").find(".sprite").removeClass("collapsed"),
    d.removeClass("hide"), Settings.REPOSITORY_LAZY && this.fetch_lazyload(b, c)) : (b.children(".folder_row").find(".sprite").addClass("collapsed"), d.addClass("hide"), Settings.REPOSITORY_LAZY && b.find(".folder_content").remove());
   this.view_folder(a);
   return !1
  },
  fetch_lazyload: function(a, b) {
   (new RepositoryLazyLoad({}, {
    dialog: this,
    folder: a,
    path: b
   })).fetch();
   Saiku.ui.block("Loading...")
  },
  template_repository_folder_lazyload: function(a, b) {
   a.find(".folder_content").remove();
   a.append(_.template($("#template-repository-folder-lazyload").html())({
    repoObjects: b
   }))
  },
  populate_lazyload: function(a, b) {
   Saiku.ui.unblock();
   this.template_repository_folder_lazyload(a, b)
  },
  select_and_open_query: function(a) {
   a = $(a.currentTarget).find("a");
   var b = a.attr("href").replace("#", "");
   a.text();
   this.selected_query = new SavedQuery({
    file: b,
    name: b
   });
   this.open_query()
  },
  open_query: function(a) {
   Saiku.ui.block("Opening query...");
   var b = this.queries[this.selected_query.get("file")],
    c = _.extend({
     file: this.selected_query.get("file"),
     formatter: Settings.CELLSET_FORMATTER
    }, Settings.PARAMS),
    c = new Query(c, {
     name: this.selected_query.get("name")
    }),
    d = null;
   a && !a.hasOwnProperty("currentTarget") && (d = a);
   "saiku" === b.fileType ? Saiku.tabs.add(new Workspace({
    query: c,
    item: b,
    viewState: d,
    processURI: !1
   })) : Saiku.session.trigger("openQuery:open_query", {
    query: c,
    item: b,
    viewState: d
   });
   return !1
  },
  open_contents: function(a) {
   var b = [],
    c = this.queries[this.selected_query.get("file")];
   _.forEach(c.repoObjects, function(a) {
    "FILE" === a.type && b.push(a)
   });
   (new WarningModal({
    title: "Open Multiple Queries",
    message: '\x3cspan class\x3d"i18n"\x3eYou are about to open\x3c/span\x3e ' +
     b.length + ' \x3cspan class\x3d"i18n"\x3equeries\x3c/span\x3e',
    okay: this.run_open_contents,
    okayobj: {
     files: b,
     viewstate: a
    }
   })).render().open();
   return !1
  },
  run_open_contents: function(a) {
   _.forEach(a.files, function(b) {
    Saiku.ui.block("Opening query...");
    var c = _.extend({
      file: b.path,
      formatter: Settings.CELLSET_FORMATTER
     }, Settings.PARAMS),
     c = new Query(c, {
      name: b.name
     }),
     d = null;
    a.viewstate && !a.viewstate.hasOwnProperty("currentTarget") && (d = viewstate);
    Saiku.tabs.add(new Workspace({
     query: c,
     item: b,
     viewState: d,
     processURI: !1
    }))
   })
  },
  edit_query: function() {
   this.open_query("edit")
  },
  delete_repoObject: function(a) {
   (new DeleteRepositoryObject({
    query: this.selected_query,
    success: this.clear_query
   })).render().open();
   return !1
  },
  move_repoObject: function(a) {
   (new MoveRepositoryObject({
    query: this.selected_query,
    success: this.clear_query
   })).render().open();
   return !1
  },
  edit_folder: function(a) {
   alert("todo: edit folder properties/permissions");
   return !1
  },
  edit_permissions: function(a) {
   (new PermissionsModal({
    workspace: this.workspace,
    title: "\x3cspan class\x3d'i18n'\x3ePermissions\x3c/span\x3e",
    file: this.selected_query.get("file")
   })).open()
  },
  clear_query: function() {
   $(this.el).find(".workspace_toolbar").addClass("hide");
   $(this.el).find(".workspace_results").html("");
   this.fetch_queries()
  },
  adjust: function() {
   $separator = $(this.el).find(".sidebar_separator");
   $separator.height($("body").height() - 87);
   $(this.el).find(".sidebar").css({
    width: 350,
    height: $("body").height() - 87
   });
   $(this.el).find(".workspace_inner").css({
    "margin-left": 355
   });
   $(this.el).find(".workspace").css({
    "margin-left": -355
   });
   $(this.el).find(".workspace_results").css({
    width: $(document).width() -
     $(this.el).find(".sidebar").width() - 30,
    height: $(document).height() - $("#header").height() - $(this.el).find(".workspace_toolbar").height() - $(this.el).find(".workspace_fields").height() - 40
   })
  },
  toggle_sidebar: function() {
   $(this.el).find(".sidebar").toggleClass("hide");
   var a = $(this.el).find(".sidebar").hasClass("hide") ? 5 : 265;
   $(this.el).find(".workspace_inner").css({
    "margin-left": a
   })
  },
  unselect_current_selected: function() {
   $(this.el).find(".selected").removeClass("selected")
  }
 }),
 SaveQuery = Modal.extend({
  type: "save",
  closeText: "Save",
  events: {
   click: "select_root_folder",
   "click .dialog_footer a": "call",
   "submit form": "save",
   "click .query": "select_name",
   "click li.folder": "toggle_folder",
   "keyup .search_file": "search_file",
   "click .cancel_search": "cancel_search"
  },
  buttons: [{
   text: "Save",
   method: "save"
  }, {
   text: "Cancel",
   method: "close"
  }],
  folder_name: null,
  file_name: null,
  initialize: function(a) {
   var b = this,
    c = "",
    d = "";
   if (a.query.name) {
    a.query.name = a.query.name.replace(/:/g, "/");
    var e = a.query.name.split("/"),
     d = a.query.name;
    this.file_name =
     c = e[e.length - 1];
    1 < e.length && (this.folder_name = e.splice(0, e.length - 1).join("/"))
   }
   this.query = a.query;
   this.message = _.template("\x3cform id\x3d'save_query_form'\x3e\x3cdiv class\x3d\"box-search-file form-inline\" style\x3d\"height:35px; padding-top:10px; line-height:25px;\"\x3e\x3clabel class\x3d\"i18n\"\x3eSearch:\x3c/label\x3e \x26nbsp; \x3cinput type\x3d\"text\" class\x3d\"form-control search_file\"\x3e\x3c/input\x3e\x3cspan class\x3d\"cancel_search\"\x3e\x3c/span\x3e\x3c/div\x3e\x3cdiv class\x3d'RepositoryObjects'\x3e\x3cspan class\x3d'i18n'\x3eLoading...\x3c/span\x3e\x3c/div\x3e\x3cdiv class\x3d'form-inline' style\x3d'padding-top:4px'\x3e\x3clabel for\x3d'name' class\x3d'i18n'\x3eFile:\x3c/label\x3e\x26nbsp;\x3cinput type\x3d'text' name\x3d'name' class\x3d'form-control' value\x3d'\x3c%\x3d name %\x3e' /\x3e\x3c/div\x3e\x3cbr /\x3e\x3c/form\x3e")({
    name: d
   });
   _.extend(this.options, {
    title: "Save query"
   });
   this.repository = new Repository({}, {
    dialog: this
   });
   this.bind("open", function() {
    var a = $("body").height() / 2 + $("body").height() / 6;
    420 < a && (a = 420);
    var c = ($("body").height() - 600) / 2 * 100 / $("body").height();
    $(this.el).find(".RepositoryObjects").height(a);
    $(this.el).dialog("option", "position", "center");
    $(this.el).parents(".ui-dialog").css({
     width: "550px",
     top: c + "%"
    });
    b.repository.fetch();
    Settings.REPOSITORY_LAZY && this.$el.find(".box-search-file").hide()
   });
   _.bindAll(this,
    "copy_to_repository", "close", "toggle_folder", "select_name", "populate", "set_name", "cancel_search");
   if (isIE && 9 > isIE) $(this.el).find("form").on("submit", this.save)
  },
  populate: function(a) {
   $(this.el).find(".RepositoryObjects").html(_.template($("#template-repository-objects").html())({
    repoObjects: a
   }));
   this.context_menu_disabled();
   this.select_last_location()
  },
  context_menu_disabled: function() {
   this.$el.find(".RepositoryObjects").find(".folder_row, .query").addClass("context-menu-disabled")
  },
  select_root_folder: function(a) {
   "name" !==
   $(a.target).attr("name") && this.unselect_current_selected_folder()
  },
  toggle_folder: function(a) {
   a = $(a.currentTarget);
   var b = a.children(".folder_row").find("a").attr("href"),
    b = b.replace("#", "");
   this.unselect_current_selected_folder();
   a.children(".folder_row").addClass("selected");
   var c = a.find("a").attr("href").replace("#", "");
   this.set_name(c, null);
   c = a.children(".folder_content");
   a.children(".folder_row").find(".sprite").hasClass("collapsed") ? (a.children(".folder_row").find(".sprite").removeClass("collapsed"),
    c.removeClass("hide"), Settings.REPOSITORY_LAZY && this.fetch_lazyload(a, b)) : (a.children(".folder_row").find(".sprite").addClass("collapsed"), c.addClass("hide"), Settings.REPOSITORY_LAZY && a.find(".folder_content").remove());
   this.set_last_location(b);
   $(this.el).find('input[name\x3d"name"]').focus();
   return !1
  },
  fetch_lazyload: function(a, b) {
   (new RepositoryLazyLoad({}, {
    dialog: this,
    folder: a,
    path: b
   })).fetch();
   Saiku.ui.block("Loading...")
  },
  template_repository_folder_lazyload: function(a, b) {
   a.find(".folder_content").remove();
   a.append(_.template($("#template-repository-folder-lazyload").html())({
    repoObjects: b
   }))
  },
  populate_lazyload: function(a, b) {
   Saiku.ui.unblock();
   this.template_repository_folder_lazyload(a, b)
  },
  set_name: function(a, b) {
   if (null !== a) {
    this.folder_name = a;
    var c = (null !== this.folder_name ? this.folder_name + "/" : "") + (null !== this.file_name ? this.file_name : "");
    $(this.el).find('input[name\x3d"name"]').val(c)
   }
   null !== b && $(this.el).find('input[name\x3d"name"]').val(b)
  },
  search_file: function(a) {
   var b = $(this.el).find(".search_file").val().toLowerCase();
   "undefined" == typeof b || "" === b || null === b || 27 == a.which || 9 == a.which ? this.cancel_search() : ($(this.el).find(".search_file").val() ? $(this.el).find(".cancel_search").show() : $(this.el).find(".cancel_search").hide(), $(this.el).find("li.query").removeClass("hide"), $(this.el).find("li.query a").filter(function(a) {
     return -1 == $(this).text().toLowerCase().indexOf(b)
    }).parent().addClass("hide"), $(this.el).find("li.folder").addClass("hide"), $(this.el).find("li.query").not(".hide").parents("li.folder").removeClass("hide"),
    $(this.el).find("li.folder .folder_row").find(".sprite").removeClass("collapsed"), $(this.el).find("li.folder .folder_content").removeClass("hide"));
   return !1
  },
  cancel_search: function(a) {
   $(this.el).find("input.search_file").val("");
   $(this.el).find(".cancel_search").hide();
   $(this.el).find("li.query, li.folder").removeClass("hide");
   $(this.el).find(".folder_row").find(".sprite").addClass("collapsed");
   $(this.el).find("li.folder .folder_content").addClass("hide");
   $(this.el).find(".search_file").val("").focus();
   $(this.el).find(".cancel_search").hide()
  },
  select_name: function(a) {
   a = $(a.currentTarget);
   this.unselect_current_selected_folder();
   a.addClass("selected");
   var b = a.find("a").attr("href").replace("#", "");
   this.set_name(null, b);
   a = a.parent().parent().has(".folder").children(".folder_row").find("a").attr("href");
   a = a.replace("#", "");
   this.set_last_location(a);
   $(this.el).find('input[name\x3d"name"]').focus();
   return !1
  },
  unselect_current_selected_folder: function() {
   $(this.el).find(".selected").removeClass("selected")
  },
  save: function(a) {
   var b = this,
    c = $(this.el).find('input[name\x3d"name"]').val();
   null !== this.folder_name && void 0 !== this.folder_name && 0 < this.folder_name.length ? null !== c && 0 < c.length ? this.repository.fetch({
    success: function(d, e) {
     var f = [];
     f.push.apply(f, b.get_files(e));
     if (-1 < f.indexOf(c) && b.query.get("name") != c)(new OverwriteModal({
      name: c,
      foldername: "",
      parent: b
     })).render().open();
     else return b.query.set({
      name: c,
      folder: ""
     }), b.query.trigger("query:save"), b.copy_to_repository(), a.stopPropagation(), a.preventDefault(), !1
    }
   }) : alert("You need to enter a name!") : alert("You need select a folder!");
   return !1
  },
  save_remote: function(a, b, c) {
   c.query.set({
    name: a,
    folder: b
   });
   c.query.trigger("query:save");
   c.copy_to_repository();
   event.preventDefault();
   return !1
  },
  get_files: function(a) {
   var b = this,
    c = [];
   _.each(a, function(a) {
    "FOLDER" === a.type ? c.push.apply(c, b.get_files(a.repoObjects)) : c.push(a.path)
   });
   return c
  },
  copy_to_repository: function() {
   var a = this,
    b = this.query.get("folder"),
    c = this.query.get("name"),
    c = 6 < c.length && c.indexOf(".saiku") ==
    c.length - 6 ? c : c + ".saiku",
    c = b + c;
   this.query.workspace.tab.$el.find(".saikutab").text(c.replace(/^.*[\\\/]/, "").split(".")[0]);
   (new SavedQuery({
    name: this.query.get("name"),
    file: c,
    content: JSON.stringify(this.query.model)
   })).save({}, {
    success: this.close,
    error: function(b, c, f) {
     c && 403 == c.status && c.responseText ? alert(c.responseText) : a.close();
     return !0
    },
    dataType: "text"
   })
  },
  set_last_location: function(a) {
   "undefined" !== typeof localStorage && localStorage && !Settings.REPOSITORY_LAZY && (Settings.LOCALSTORAGE_EXPIRATION &&
    0 !== Settings.LOCALSTORAGE_EXPIRATION ? localStorage.setItem("last-folder", a) : localStorage.clear())
  },
  select_last_location: function() {
   localStorage.getItem("last-folder") && !Settings.REPOSITORY_LAZY && $(this.el).find('a[href\x3d"\\#' + localStorage.getItem("last-folder") + '"]').parent().parent().has(".folder").children(".folder_row").find(".sprite").removeClass("collapsed").parentsUntil($("div.RepositoryObjects")).each(function() {
    $(this).hasClass("folder") && ($(this).children(".folder_row").find(".sprite").removeClass("collapsed"),
     $(this).children(".folder_content").removeClass("hide"))
   })
  }
 }),
 OpenDialog = Modal.extend({
  type: "save",
  closeText: "Open",
  events: {
   click: "select_root_folder",
   "click .dialog_footer a": "call",
   "click .query": "select_name",
   "dblclick .query": "open_query",
   "click li.folder": "toggle_folder",
   "keyup .search_file": "search_file",
   "click .cancel_search": "cancel_search",
   "click .export_btn": "export_zip",
   "change .file": "select_file"
  },
  buttons: [{
   id: "test",
   text: "Open",
   method: "open_query"
  }, {
   text: "Cancel",
   method: "close"
  }],
  initialize: function(a) {
   var b =
    this;
   this.message = '\x3cdiv class\x3d"box-search-file form-inline" style\x3d"padding-top:10px; height:35px; line-height:25px;"\x3e\x3clabel class\x3d"i18n"\x3eSearch:\x3c/label\x3e \x26nbsp; \x3cinput type\x3d"text" class\x3d"form-control search_file"\x3e\x3c/input\x3e\x3cspan class\x3d"cancel_search"\x3e\x3c/span\x3e\x3c/div\x3e\x3cdiv class\x3d\'RepositoryObjects i18n\'\x3eLoading...\x3c/div\x3e\x3cbr\x3e\x3cb\x3e\x3cdiv class\x3d\'query_name\'\x3e\x3cspan class\x3d\'i18n\'\x3ePlease select a file.....\x3c/span\x3e\x3c/div\x3e\x3c/b\x3e\x3cbr/\x3e';
   Settings.ALLOW_IMPORT_EXPORT && (this.message += "\x3cspan class\x3d'export_zip'\x3e \x3c/span\x3e \x3cb\x3e\x3cspan class\x3d'i18n'\x3eImport or Export Files for Folder\x3c/span\x3e: \x3c/b\x3e \x3cspan class\x3d'i18n zip_folder'\x3e\x3c Select Folder... \x3e\x3c/span\x3e \x26nbsp; \x3cinput type\x3d'submit' value\x3d'Export' class\x3d'export_btn' disabled /\x3e\x3cbr/\x3e\x3cbr /\x3e\x3cbr /\x3e\x3cform id\x3d'importForm' target\x3d'_blank' method\x3d'POST' enctype\x3d'multipart/form-data'\x3e\x3cinput type\x3d'hidden' name\x3d'directory' class\x3d'directory'/\x3e\x3cinput type\x3d'file' name\x3d'file' class\x3d'file'/\x3e\x3cinput type\x3d'submit' value\x3d'Import' class\x3d'import_btn' disabled /\x3e\x3c/form\x3e");
   _.extend(this.options, {
    title: "Open"
   });
   this.selected_folder = null;
   this.repository = new Repository({}, {
    dialog: this
   });
   this.bind("open", function() {
    var a = $("body").height() / 2 + $("body").height() / 6;
    420 < a && (a = 420);
    var d = ($("body").height() - 600) / 2 * 100 / $("body").height();
    $(this.el).find(".RepositoryObjects").height(a);
    $(this.el).dialog("option", "position", "center");
    $(this.el).parents(".ui-dialog").css({
     width: "550px",
     top: d + "%"
    });
    $(this.el).find(".dialog_footer").find('a[href\x3d"#open_query"]').hide();
    b.repository.fetch();
    Settings.REPOSITORY_LAZY && this.$el.find(".box-search-file").hide()
   });
   _.bindAll(this, "close", "toggle_folder", "select_name", "populate", "cancel_search", "export_zip", "select_folder", "select_file", "select_last_location")
  },
  populate: function(a) {
   function b(a) {
    _.forEach(a, function(a) {
     c.queries[a.path] = a;
     "FOLDER" === a.type && b(a.repoObjects)
    })
   }
   var c = this;
   $(this.el).find(".RepositoryObjects").html(_.template($("#template-repository-objects").html())({
    repoObjects: a
   }));
   c.queries = {};
   b(a);
   this.context_menu_disabled();
   this.select_last_location()
  },
  context_menu_disabled: function() {
   this.$el.find(".RepositoryObjects").find(".folder_row, .query").addClass("context-menu-disabled")
  },
  select_root_folder: function(a) {
   "name" !== $(a.target).attr("name") && this.unselect_current_selected_folder()
  },
  toggle_folder: function(a) {
   a = $(a.currentTarget);
   var b = a.children(".folder_row").find("a").attr("href"),
    b = b.replace("#", "");
   this.unselect_current_selected_folder();
   a.children(".folder_row").addClass("selected");
   var c = a.children(".folder_content");
   a.children(".folder_row").find(".sprite").hasClass("collapsed") ? (a.children(".folder_row").find(".sprite").removeClass("collapsed"), c.removeClass("hide"), Settings.REPOSITORY_LAZY && this.fetch_lazyload(a, b)) : (a.children(".folder_row").find(".sprite").addClass("collapsed"), c.addClass("hide"), Settings.REPOSITORY_LAZY && a.find(".folder_content").remove());
   this.select_folder();
   this.set_last_location(b);
   return !1
  },
  fetch_lazyload: function(a, b) {
   (new RepositoryLazyLoad({}, {
    dialog: this,
    folder: a,
    path: b
   })).fetch();
   Saiku.ui.block("Loading...")
  },
  template_repository_folder_lazyload: function(a, b) {
   a.find(".folder_content").remove();
   a.append(_.template($("#template-repository-folder-lazyload").html())({
    repoObjects: b
   }))
  },
  populate_lazyload: function(a, b) {
   Saiku.ui.unblock();
   this.template_repository_folder_lazyload(a, b)
  },
  select_name: function(a) {
   a = $(a.currentTarget);
   this.unselect_current_selected_folder();
   var b = a.parent().parent().has(".folder").children(".folder_row").find("a").attr("href"),
    b = b.replace("#", "");
   this.set_last_location(b);
   a.addClass("selected");
   a = a.find("a").attr("href");
   a = a.replace("#", "");
   $(this.el).find(".query_name").html(a);
   $(this.el).find(".dialog_footer").find('a[href\x3d"#open_query"]').show();
   this.select_folder();
   return !1
  },
  unselect_current_selected_folder: function() {
   $(this.el).find(".selected").removeClass("selected")
  },
  search_file: function(a) {
   var b = $(this.el).find(".search_file").val().toLowerCase();
   "undefined" == typeof b || "" === b || null === b || 27 == a.which || 9 == a.which ? this.cancel_search() : ($(this.el).find(".search_file").val() ?
    $(this.el).find(".cancel_search").show() : $(this.el).find(".cancel_search").hide(), $(this.el).find("li.query").removeClass("hide"), $(this.el).find("li.query a").filter(function(a) {
     return -1 == $(this).text().toLowerCase().indexOf(b)
    }).parent().addClass("hide"), $(this.el).find("li.folder").addClass("hide"), $(this.el).find("li.query").not(".hide").parents("li.folder").removeClass("hide"), $(this.el).find("li.folder .folder_row").find(".sprite").removeClass("collapsed"), $(this.el).find("li.folder .folder_content").removeClass("hide"));
   return !1
  },
  cancel_search: function(a) {
   $(this.el).find("input.search_file").val("");
   $(this.el).find(".cancel_search").hide();
   $(this.el).find("li.query, li.folder").removeClass("hide");
   $(this.el).find(".folder_row").find(".sprite").addClass("collapsed");
   $(this.el).find("li.folder .folder_content").addClass("hide");
   $(this.el).find(".search_file").val("").focus();
   $(this.el).find(".cancel_search").hide()
  },
  export_zip: function(a) {
   a = this.selected_folder;
   if ("undefined" != typeof a && "" !== a) {
    var b = Settings.REST_URL +
     (new RepositoryZipExport({
      directory: a
     })).url();
    window.open(b + "?directory\x3d" + a + "\x26type\x3dsaiku")
   }
  },
  select_folder: function() {
   var a = $(this.el).find(".selected"),
    a = 0 < a.length ? a.children("a").attr("href").replace("#", "") : null;
   if ("undefined" != typeof a && null !== a && "" !== a) {
    var b = $("#importForm");
    b.find(".directory").val(a);
    var c = Settings.REST_URL + (new RepositoryZipExport).url() + "upload";
    b.attr("action", c);
    $(this.el).find(".zip_folder").text(a);
    this.selected_folder = a;
    $(this.el).find(".export_btn, .import_btn").removeAttr("disabled");
    this.select_file()
   } else $(this.el).find(".import_btn, .export_btn").attr("disabled", "true")
  },
  select_file: function() {
   var a = $("#importForm").find(".file").val();
   "undefined" != typeof a && "" !== a && null !== a && null !== this.selected_folder ? $(this.el).find(".import_btn").removeAttr("disabled") : $(this.el).find(".import_btn").attr("disabled", "true")
  },
  open_query: function(a) {
   var b = $(a.currentTarget),
    c = $(this.el).find(".query_name").html();
   b.hasClass("query") && (c = b.find("a").attr("href").replace("#", ""));
   new SavedQuery({
    file: c
   });
   this.close();
   Saiku.ui.block("Opening query...");
   var b = this.queries[c],
    d = _.extend({
     file: c,
     formatter: Settings.CELLSET_FORMATTER
    }, Settings.PARAMS),
    c = new Query(d, {
     name: c
    });
   Saiku.tabs.add(new Workspace({
    query: c,
    item: b,
    processURI: !1
   }));
   a.preventDefault();
   return !1
  },
  set_last_location: function(a) {
   "undefined" !== typeof localStorage && localStorage && !Settings.REPOSITORY_LAZY && (Settings.LOCALSTORAGE_EXPIRATION && 0 !== Settings.LOCALSTORAGE_EXPIRATION ? localStorage.setItem("last-folder", a) : localStorage.clear())
  },
  select_last_location: function() {
   localStorage.getItem("last-folder") &&
    !Settings.REPOSITORY_LAZY && $(this.el).find('a[href\x3d"\\#' + localStorage.getItem("last-folder") + '"]').parent().parent().has(".folder").children(".folder_row").find(".sprite").removeClass("collapsed").parentsUntil($("div.RepositoryObjects")).each(function() {
     $(this).hasClass("folder") && ($(this).children(".folder_row").find(".sprite").removeClass("collapsed"), $(this).children(".folder_content").removeClass("hide"))
    })
  }
 }),
 Tab = Backbone.View.extend({
  tagName: "li",
  events: {
   "click a": "select",
   "mousedown a": "remove",
   "click .close_tab": "remove"
  },
  template: function() {
   return _.template("\x3ca class\x3d'saikutab' href\x3d'#\x3c%\x3d id %\x3e'\x3e\x3c%\x3d caption %\x3e\x3c/a\x3e\x3cspan class\x3d'close_tab sprite'\x3eClose tab\x3c/span\x3e")({
    id: this.id,
    caption: this.caption
   })
  },
  initialize: function(a) {
   _.extend(this, Backbone.Events);
   _.extend(this, a);
   this.content.tab = this;
   this.caption = this.content.caption();
   this.id = _.uniqueId("tab_");
   this.close = a.close
  },
  render: function() {
   var a = this;
   this.content.render();
   $(this.el).html(this.template());
   !1 === this.close && ($(this.el).find(".close_tab").hide(), $(this.el).css("padding-right", "10px"));
   var b = {
    "new": {
     name: "New",
     i18n: !0
    },
    duplicate: {
     name: "Duplicate",
     i18n: !0
    },
    closeothers: {
     name: "Close Others",
     i18n: !0
    },
    closethis: {
     name: "Close This",
     i18n: !0
    }
   };
   $.each(b, function(a, b) {
    recursive_menu_translate(b, Saiku.i18n.po_file)
   });
   $.contextMenu("destroy", ".saikutab");
   $.contextMenu({
    selector: ".saikutab",
    callback: function(b, d) {
     var e = d.$trigger.attr("href").replace("#", ""),
      e = Saiku.tabs.find(e);
     "closethis" == b ? (e.remove(),
      a.select()) : "closeothers" == b ? (e.select(), Saiku.tabs.close_others(e)) : "duplicate" == b ? Saiku.tabs.duplicate(e) : "new" == b && Saiku.tabs.new_tab()
    },
    items: b
   });
   return this
  },
  set_caption: function(a) {
   $(this.el).find(".saikutab").html(a)
  },
  destroy: function() {
   this.content && this.content.query && this.content.query.destroy()
  },
  select: function() {
   this.parent.select(this);
   $(this.el).addClass("selected");
   this.trigger("tab:select");
   return !1
  },
  remove: function(a) {
   if (!a || 2 === a.which || $(a.target).hasClass("close_tab")) {
    this.parent.remove(this);
    try {
     $(this.el).remove(), this.destroy()
    } catch (b) {
     Log.log(JSON.stringify({
      Message: "Tab could not be removed",
      Tab: JSON.stringify(this)
     }))
    }
   }
   return !1
  },
  rendered: function() {
   return $.contains(document, this.el)
  }
 }),
 TabPager = Backbone.View.extend({
  className: "pager_contents",
  events: {
   "click a": "select"
  },
  initialize: function(a) {
   this.tabset = a.tabset;
   $(this.el).hide().appendTo("body");
   $(window).click(function(a) {
    $(a.target).hasClass("pager_contents") || $(".pager_contents").hide()
   })
  },
  render: function() {
   for (var a = "", b =
     0, c = this.tabset._tabs.length; b < c; b++) a += "\x3ca href\x3d'#" + b + "'\x3e" + this.tabset._tabs[b].caption + "\x3c/a\x3e\x3cbr /\x3e";
   $(this.el).html(a);
   $(this.el).find(".i18n").i18n(Saiku.i18n.po_file)
  },
  select: function(a) {
   var b = $(a.target).attr("href").replace("#", "");
   this.tabset._tabs[b].select();
   $(this.el).hide();
   a.preventDefault();
   return !1
  }
 }),
 TabSet = Backbone.View.extend({
  className: "tabs",
  queryCount: 0,
  dashCount: 0,
  events: {
   "click a.pager": "togglePager",
   "click a.new": "new_tab"
  },
  _tabs: [],
  render: function() {
   $(this.el).html('\x3ca href\x3d"#pager" class\x3d"pager sprite"\x3e\x3c/a\x3e\x3cul\x3e\x3cli class\x3d"newtab"\x3e\x3ca class\x3d"new"\x3e+\x26nbsp;\x26nbsp;\x3c/a\x3e\x3c/li\x3e\x3c/ul\x3e').appendTo($("#header"));
   this.content = $('\x3cdiv id\x3d"tab_panel"\x3e').appendTo($("body"));
   this.pager = new TabPager({
    tabset: this
   });
   return this
  },
  add: function(a, b) {
   "dashboards" === a.pluginName ? this.dashCount++ : this.queryCount++;
   var c = new Tab({
    content: a,
    close: b
   });
   this._tabs.push(c);
   c.parent = this;
   c.render().select();
   $(c.el).insertBefore($(this.el).find("ul li.newtab"));
   Saiku.session.trigger("tab:add", {
    tab: c
   });
   this.pager.render();
   Saiku.i18n.translate();
   Saiku.session.trigger("workspace:toolbar:render", null);
   return c
  },
  find: function(a) {
   for (var b =
     0, c = this._tabs.length; b < c; b++)
    if (this._tabs[b].id == a) return this._tabs[b];
   return null
  },
  select: function(a) {
   $(this.el).find("li").removeClass("selected");
   Saiku.session.tabSelected = a.id;
   Saiku.session.trigger("tab:select", {
    tab: a
   });
   this.content.children().detach();
   this.content.append($(a.content.el))
  },
  remove: function(a) {
   for (var b = 0, c = this._tabs.length; b < c; b++) this._tabs[b] == a && (this._tabs.splice(b, 1), Saiku.session.trigger("tab:remove", {
    tab: a
   }), this.pager.render(), this._tabs[this._tabs[b] ? b : this._tabs.length -
    1].select());
   return !0
  },
  close_others: function(a) {
   var b = _.indexOf(this._tabs, a);
   this._tabs[b].select();
   for (b = 0; 1 < this._tabs.length;) this._tabs[b] != a ? this._tabs[b].remove() : b++
  },
  close_all: function() {
   for (var a = 0, b = this._tabs.length; a < b; a++) this._tabs[a].remove()
  },
  togglePager: function() {
   $(this.pager.el).toggle();
   return !1
  },
  new_tab: function() {
   this.add(new Workspace);
   this._tabs[this._tabs.length - 1].select();
   return !1
  },
  duplicate: function(a) {
   Saiku.ui.block("Duplicating tab...");
   a.content.query ? this.add(new Workspace({
    query: new Query({
      json: JSON.stringify(a.content.query.model)
     },
     Settings.PARAMS),
    viewState: a.content.viewState
   })) : this.add(new Workspace);
   Saiku.ui.unblock();
   return !1
  }
 }),
 RepositoryUrl = "api/repository",
 repoPathUrl = function() {
  return Settings.BIPLUGIN ? "pentaho/repository" : RepositoryUrl
 },
 RepositoryObject = Backbone.Model.extend({
  initialize: function(a, b) {
   b && b.dialog && (this.dialog = b.dialog, this.file = b.file)
  },
  parse: function(a) {
   if (this.dialog) return this.dialog.generate_grids_reports(a), a
  },
  url: function() {
   return this.file ? repoPathUrl() + "/resource?file\x3d" + this.file : repoPathUrl() +
    "/resource"
  }
 }),
 RepositoryAclObject = Backbone.Model.extend({
  url: function() {
   return repoPathUrl() + "/resource/acl"
  },
  parse: function(a) {
   "OK" != a && _.extend(this.attributes, a)
  }
 }),
 RepositoryZipExport = Backbone.Model.extend({
  url: function() {
   return repoPathUrl() + "/zip"
  }
 }),
 SavedQuery = Backbone.Model.extend({
  parse: function(a) {},
  url: function() {
   return repoPathUrl() + "/resource"
  },
  move_query_to_workspace: function(a, b) {
   var c = b,
    d = a.get("file"),
    e;
   for (e in Settings)
    if ("PARAM" == e.match("^PARAM")) var f = e.substring(5, e.length),
     g = new RegExp("\\$\\{" + f + "\\}", "g"),
     f = new RegExp("\\$\\{" + f.toLowerCase() + "\\}", "g"),
     c = c.replace(g, Settings[e]),
     c = c.replace(f, Settings[e]);
   c = new Query({
    xml: c,
    formatter: Settings.CELLSET_FORMATTER
   }, {
    name: d
   });
   Saiku.tabs.add(new Workspace({
    query: c
   }))
  }
 }),
 Repository = Backbone.Collection.extend({
  model: SavedQuery,
  file: null,
  initialize: function(a, b) {
   b && b.dialog && (this.dialog = b.dialog, this.type = b.type)
  },
  parse: function(a) {
   this.dialog && this.dialog.populate(a);
   return a
  },
  url: function() {
   var a = repoPathUrl() + "?type\x3d" +
    (this.type ? this.type : "saiku,sdb");
   Settings.REPO_BASE && !this.file && (a += "\x26path\x3d" + Settings.REPO_BASE);
   return a
  }
 }),
 RepositoryLazyLoad = Backbone.Model.extend({
  url: function() {
   return repoPathUrl() + "?type\x3d" + (this.type ? this.type : "saiku,sdb") + "\x26path\x3d" + this.path
  },
  initialize: function(a, b) {
   b && b.dialog && (this.dialog = b.dialog, this.folder = b.folder, this.path = b.path)
  },
  parse: function(a) {
   this.dialog && this.dialog.populate_lazyload(this.folder, a);
   return a
  }
 }),
 Result = Backbone.Model.extend({
  result: null,
  firstRun: !1,
  initialize: function(a, b) {
   this.query = b.query
  },
  parse: function(a) {
   this.query.workspace.unblock();
   this.query.workspace.processing.hide();
   this.result = a;
   a.error || (this.query.model = _.extend({}, a.query));
   this.firstRun = !0;
   this.query.workspace.trigger("query:result", {
    workspace: this.query.workspace,
    data: a
   })
  },
  hasRun: function() {
   return this.firstRun
  },
  lastresult: function() {
   return this.result
  },
  url: function() {
   return "api/query/execute"
  }
 }),
 QueryAction = Backbone.Model.extend({
  initialize: function(a, b) {
   this.query = b.query;
   this.url = this.query.url
  },
  gett: function(a, b) {
   this.handle("fetch", a, b)
  },
  post: function(a, b) {
   this.handle("save", a, b)
  },
  put: function(a, b) {
   this.id = _.uniqueId("queryaction_");
   this.handle("save", a, b);
   delete this.id
  },
  del: function(a, b) {
   this.id = _.uniqueId("queryaction_");
   this.handle("delete", a, b);
   delete this.id
  },
  handle: function(a, b, c) {
   this.url = this.query.url() + b;
   this.attributes = c.data ? c.data : {};
   "save" == a ? this.save({}, c) : "delete" == a ? (this.set("id", this.id), this.destroy(c)) : "fetch" == a && (this.parse = function() {},
    this.fetch(c))
  }
 }),
 QueryScenario = Backbone.Model.extend({
  initialize: function(a, b) {
   _.bindAll(this, "attach_listeners", "activate", "clicked_cell", "save_writeback", "cancel_writeback", "check_input");
   this.query = b.query
  },
  activate: function() {
   $(this.query.workspace.el).find("td.data").unbind("click").addClass("cellhighlight").click(this.clicked_cell)
  },
  attach_listeners: function(a) {
   a.workspace.query && a.workspace.query.properties && "true" === a.workspace.query.properties.properties["org.saiku.connection.scenario"] &&
    $(a.workspace.el).find(".query_scenario").hasClass("on") && $(a.workspace.el).find("td.data").click(this.clicked_cell)
  },
  clicked_cell: function(a) {
   a = $(a.target).hasClass("data") ? $(a.target).find("div") : $(a.target);
   var b = a.attr("alt");
   a.attr("rel");
   b = $("\x3cinput type\x3d'text' value\x3d'" + b + "' /\x3e").keyup(this.check_input).blur(this.cancel_writeback);
   a.html("").append(b);
   b.focus()
  },
  check_input: function(a) {
   13 == a.which ? this.save_writeback(a) : 27 != a.which && 9 != a.which || this.cancel_writeback(a);
   return !1
  },
  save_writeback: function(a) {
   a = $(a.target).closest("input");
   this.set({
    value: a.val(),
    position: a.parent().attr("rel")
   });
   this.save();
   var b = a.val();
   a.parent().text(b)
  },
  cancel_writeback: function(a) {
   a = $(a.target).closest("input");
   a.parent().text(a.parent().attr("alt"))
  },
  parse: function() {
   this.query.run()
  },
  url: function() {
   return this.query.url() + "/cell/" + this.get("position") + "/" + this.get("value")
  }
 }),
 Query = Backbone.Model.extend({
  formatter: Settings.CELLSET_FORMATTER,
  properties: null,
  initialize: function(a, b) {
   _.extend(this,
    b);
   _.bindAll(this, "run");
   this.uuid = "xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(a) {
    var b = 16 * Math.random() | 0;
    return ("x" == a ? b : b & 3 | 8).toString(16)
   }).toUpperCase();
   this.model = _.extend({
    name: this.uuid
   }, SaikuOlapQueryTemplate);
   a.cube && (this.model.cube = a.cube);
   this.helper = new SaikuOlapQueryHelper(this);
   this.action = new QueryAction({}, {
    query: this
   });
   this.result = new Result({
    limit: Settings.RESULT_LIMIT
   }, {
    query: this
   });
   this.scenario = new QueryScenario({}, {
    query: this
   })
  },
  parse: function(a) {
   this.id =
    this.uuid;
   a.name && (this.uuid = this.id = a.name);
   this.model = _.extend(this.model, a);
   this.model.properties = _.extend({}, Settings.QUERY_PROPERTIES, this.model.properties)
  },
  setProperty: function(a, b) {
   this.model.properties[a] = b
  },
  getProperty: function(a) {
   return this.model.properties[a]
  },
  run: function(a, b) {
   var c = this;
   Saiku.ui.unblock();
   if ("undefined" == typeof this.model.properties || !1 !== this.model.properties["saiku.olap.query.automatic_execution"] || !1 !== a && void 0 !== a && null !== a) {
    this.workspace.unblock();
    $(this.workspace.el).find(".workspace_results_info").empty();
    this.workspace.trigger("query:run");
    this.result.result = null;
    var d = !1,
     e = '\x3cspan class\x3d"i18n"\x3eQuery Validation failed!\x3c/span\x3e',
     f = this.helper.model(),
     g;
    for (g in this.attributes) {
     var h = this.attributes[g];
     if ("PARAM" === g.substring(0, 5)) {
      var k = g.substring(5, g.length);
      f.parameters[k] = h
     }
    }
    "OLAP" == f.queryType && ("QUERYMODEL" == f.type ? (g = 0 < Object.keys(f.queryModel.axes.COLUMNS.hierarchies).length, h = 0 < Object.keys(f.queryModel.axes.ROWS.hierarchies).length, k = "COLUMNS" == f.queryModel.details.axis && 0 <
     f.queryModel.details.measures.length, h && g && k || (e = ""), g || k || (e += '\x3cspan class\x3d"i18n"\x3eYou need to include at least one measure or a level on columns for a valid query.\x3c/span\x3e'), h || (e += '\x3cspan class\x3d"i18n"\x3eYou need to include at least one level on rows for a valid query.\x3c/span\x3e'), (g || k) && h && (d = !0)) : "MDX" == f.type && ((d = f.mdx && 0 < f.mdx.length) || (e = '\x3cspan class\x3d"i18n"\x3eYou need to enter some MDX statement to execute.\x3c/span\x3e')));
    d ? (this.workspace.table.clearOut(),
     $(this.workspace.processing).html('\x3cspan class\x3d"processing_image"\x3e\x26nbsp;\x26nbsp;\x3c/span\x3e \x3cspan class\x3d"i18n"\x3eRunning query...\x3c/span\x3e [\x26nbsp;\x3ca class\x3d"cancel i18n" href\x3d"#cancel"\x3eCancel\x3c/a\x3e\x26nbsp;]').show(), this.workspace.adjust(), this.workspace.trigger("query:fetch"), Saiku.i18n.translate(), this.workspace.block('\x3cspan class\x3d"processing_image"\x3e\x26nbsp;\x26nbsp;\x3c/span\x3e \x3cspan class\x3d"i18n"\x3eRunning query...\x3c/span\x3e [\x26nbsp;\x3ca class\x3d"cancel i18n" href\x3d"#cancel"\x3eCancel\x3c/a\x3e\x26nbsp;]'),
     this.result.save({}, {
      contentType: "application/json",
      data: JSON.stringify(f),
      error: function() {
       Saiku.ui.unblock();
       c.workspace.table.clearOut();
       $(c.workspace.processing).html('\x3cspan class\x3d"i18n"\x3eError executing query. Please check the server logs or contact your administrator!\x3c/span\x3e').show();
       c.workspace.adjust();
       Saiku.i18n.translate()
      }
     })) : (this.workspace.table.clearOut(), $(this.workspace.processing).html(e).show(), this.workspace.adjust(), Saiku.i18n.translate())
   }
  },
  enrich: function() {
   var a =
    this;
   this.workspace.query.action.post("/../enrich", {
    contentType: "application/json",
    data: JSON.stringify(a.model),
    async: !1,
    success: function(b, c) {
     a.model = c
    }
   })
  },
  url: function() {
   return "api/query/" + encodeURI(this.uuid)
  }
 }),
 Session = Backbone.Model.extend({
  username: null,
  password: null,
  sessionid: null,
  upgradeTimeout: null,
  isAdmin: !1,
  id: null,
  initialize: function(a, b) {
   _.extend(this, Backbone.Events);
   _.bindAll(this, "check_session", "process_session", "load_session", "login", "brute_force");
   b && b.username && b.password ? (this.username =
    b.username, this.password = b.password, Settings.DEMO ? this.check_session() : this.save({
     username: this.username,
     password: this.password
    }, {
     success: this.check_session,
     error: this.check_session
    })) : this.check_session()
  },
  check_session: function() {
   null === this.sessionid || null === this.username || null === this.password ? (this.clear(), this.fetch({
    success: this.process_session,
    error: this.brute_force
   })) : (this.username = encodeURIComponent(options.username), this.load_session())
  },
  brute_force: function(a, b) {
   this.clear();
   this.fetch({
    success: this.process_session,
    error: this.show_error
   })
  },
  show_error: function(a, b) {
   Saiku.ui.unblock();
   this.form = new SessionErrorModal({
    issue: b.responseText
   });
   this.form.render().open()
  },
  load_session: function() {
   this.sessionworkspace = new SessionWorkspace
  },
  process_session: function(a, b) {
   null === b || null == b.sessionid ? (Saiku.ui.unblock(), this.form = Settings.DEMO ? new DemoLoginForm({
    session: this
   }) : new LoginForm({
    session: this
   }), this.form.render().open()) : (this.sessionid = b.sessionid, this.roles = b.roles, this.isAdmin = b.isadmin, this.username = encodeURIComponent(b.username),
    this.language = b.language, "undefined" != typeof this.language && this.language != Saiku.i18n.locale && (Saiku.i18n.locale = this.language, Saiku.i18n.automatic_i18n()), (new License).fetch_license("api/license/", function(a) {
     "success" === a.status && (Settings.LICENSE = a.data.toJSON());
     Saiku.session.isAdmin && (new LicenseQuota).fetch_quota("api/license/quota", function(a) {
      "success" === a.status && (Settings.LICENSEQUOTA = a.data.toJSON())
     })
    }), this.load_session());
   return this
  },
  error: function() {
   $(this.form.el).dialog("open")
  },
  login: function(a, b) {
   var c = this;
   this.save({
    username: a,
    password: b
   }, {
    dataType: "text",
    success: this.check_session,
    error: function(a, b) {
     c.login_failed(b.responseText)
    }
   })
  },
  login_failed: function(a) {
   this.form = new LoginForm({
    session: this
   });
   this.form.render().open();
   this.form.setError(a)
  },
  logout: function() {
   Saiku.ui.unblock();
   $("#header").empty().hide();
   $("#tab_panel").remove();
   Saiku.tabs = new TabSet;
   Saiku.toolbar.remove();
   Saiku.toolbar = new Toolbar;
   "undefined" !== typeof localStorage && localStorage && localStorage.clear();
   this.set("id", _.uniqueId("queryaction_"));
   this.destroy({
    async: !1
   });
   this.clear();
   this.roles = this.password = this.username = this.sessionid = null;
   this.isAdmin = !1;
   this.destroy({
    async: !1
   });
   document.location.reload(!1);
   delete this.id
  },
  url: function() {
   return "session"
  }
 }),
 SessionErrorModal = Modal.extend({
  initialize: function(a, b) {
   _.extend(this.options, {
    title: "Error"
   });
   this.reportedissue = a.issue;
   this.message = "There has been an error creating a session:\x3cbr\x3e" + this.reportedissue
  },
  events: {
   "click a": "close"
  },
  dummy: function() {
   return !0
  },
  type: "info"
 }),
 SplashScreen = Backbone.View.extend({
  events: {
   "click .run_query": "run_query",
   "click .run_dashboards": "run_dashboard",
   "click .head": "click_head",
   "click .beg_tut": "run_tour"
  },
  click_head: function(a) {
   a.preventDefault();
   var b = a.target;
   a = $(b).attr("class").split(" ");
   $("nav li").removeClass("active");
   $(b).parent().addClass("active");
   $(".stabs section").hide();
   b = ""; - 1 < a.indexOf("welcome") ? b = "welcome" : -1 < a.indexOf("features") ? b = "features" : -1 < a.indexOf("help") ? b = "help" : -1 < a.indexOf("enterprise") &&
    (b = "enterprise");
   $("#" + b).fadeIn()
  },
  run_tour: function() {
   this.toolbar = Saiku.toolbar;
   (new Tour({
    toolbar: this.toolbar
   })).run_tour()
  },
  initialize: function(a) {
   _.bindAll(this, "caption");
   _.extend(this, Backbone.Events)
  },
  run_query: function() {
   Saiku.tabs.add(new Workspace);
   return !1
  },
  run_dashboard: function() {
   if (void 0 === Saiku.Dashboards) alert("Please upgrade to Saiku Enterprise for Dashboards");
   else {
    var a = _.find(Saiku.tabs._tabs, function(a) {
     return a.content instanceof Dashboards
    });
    a ? a.select() : Saiku.tabs.add(new Dashboards)
   }
   return !1
  },
  template: function() {
   //var a = $("\x3cdiv\x3e \x3cdiv id\x3d'splash'\x3e \x3cnav\x3e \x3cul\x3e \x3cli class\x3d'active'\x3e\x3ca class\x3d'welcome head' href\x3d'#'\x3eWelcome\x3c/a\x3e\x3c/li\x3e \x3cli\x3e\x3ca class\x3d'features head' href\x3d'#'\x3eFeatures\x3c/a\x3e\x3c/li\x3e \x3cli\x3e\x3ca class\x3d'help head' href\x3d'#'\x3eGet Help\x3c/a\x3e\x3c/li\x3e \x3cli class\x3d'enterprisetoggle enterprise'\x3e\x3ca class\x3d'enterprise head' href\x3d'#'\x3eEnterprise\x3c/a\x3e\x3c/li\x3e \x3c/ul\x3e \x3ch2\x3eExplore Data. Visualise. Act.\x3c/h2\x3e \x3c/nav\x3e \x3csection class\x3d'stabs'\x3e \x3csection style\x3d'margin-top:50px;min-height:700px;' id\x3d'welcome'\x3e \x3cdiv style\x3d'width:50%;float:left;'\x3e \x3ch1 class\x3d'saikulogo'\x3eSaiku\x3c/h1\x3e \x3cp\x3eSaiku has the power to change the way you think about your business and make decisions.   Saiku provides powerful, web based analytics for everyone in your organisation. Quickly and easily analyse data from any data  source to discover what is really happening inside and outside your organisation. \x3ci class\x3d'icon icon-remove' style\x3d'height: 100px;'\x3e\x3c/i\x3e  \x3c/p\x3e \x3ch2\x3eQuick Links\x3c/h2\x3e \x3cul class\x3d'quicklinks'\x3e \x3cli\x3e\x3ca class\x3d'run_query' href\x3d'#'\x3eCreate a new query\x3c/a\x3e\x3c/li\x3e \x3cli\x3e\x3ca href\x3d'#' title\x3d'Dashboards' class\x3d'run_dashboards'\x3eCreate a dashboard\x3c/a\x3e\x3c/li\x3e \x3cli\x3e  \x3ca href\x3d'http://saiku.meteorite.bi' target\x3d'_blank'\x3eVisit the website\x3c/a\x3e\x3c/li\x3e \x3cli\x3e\x3ca href\x3d'#' class\x3d'help head'\x3eTutorials\x3c/a\x3e\x3c/li\x3e \x3c/ul\x3e \x3cp class\x3d'fixed'\x3e\x3ca class\x3d'enterprisetoggle button' href\x3d'http://meteorite.bi' target\x3d'_blank'\x3eGet Enterprise\x3c/a\x3e\x3c/p\x3e \x3ch2\x3eNews\x3c/h2\x3e \x3cdiv id\x3d'news'\x3e\x3c/div\x3e \x3c/div\x3e \x3cdiv style\x3d'width:40%;margin-left:10%;float:left;' id\x3d'dyn_content' class\x3d'enterprisetoggle'\x3e \x3ch2\x3eDiscover more about Saiku\x3c/h2\x3e\x3cp\x3eSaiku Analytics provides both a Community Version and an Enterprise Version with added features. To find out more you can \x3ca href\x3d'http://meteorite.bo'\x3evisit our website\x3c/a\x3e or watch the videos on our \x3ca href\x3d'https://www.youtube.com/channel/UChivLeroOJx0_JamfuZ_XHA'\x3eYoutube channel\x3c/a\x3e.\x3c/p\x3e\x3cp\x3eIf you are using Saiku Analytics in a business or commercial product, you can help give back in many ways. Swing by our \x3ca href\x3d'http://webchat.freenode.net/?channels\x3d##saiku'IRC channel\x3c/a\x3e and help foster the community, join the \x3ca href\x3d'http://community.meteorite.bi'\x3emailing lists\x3c/a\x3e and ask/answer questions, \x3ca href\x3d'http://meteorite.bi'\x3esponsor a new feature\x3c/a\x3e, or best of all \x3ca href\x3d'http://www.meteorite.bi/saiku-pricing'\x3epurchase an EE license\x3c/a\x3e, which funds development of Saiku Community Edition along with Enterprise Edition.\x3c/p\x3e\x3cdiv\x3e\x3c/div\x3e \x3c/div\x3e \x3c/section\x3e \x3csection style\x3d'display:none !important;margin-top:50px' id\x3d'features'\x3e \x3ch1 class\x3d'saikulogo'\x3eSaiku\x3c/h1\x3e \x3ch2\x3eFeatures\x3c/h2\x3e \x3ch3\x3eWeb Based Analysis\x3c/h3\x3e \x3cp\x3eSaiku provides the user with an entirely browser based experience. We support all modern browsers, and our user interface is 100% HTML and Javascript. \x3cbr/\x3eSaiku uses REST based communications, this allows the development of custom user interfaces and facilitates the easy integration of the Saiku Server into other applications and services.\x3c/p\x3e \x3ch3\x3eStandards Compliant\x3c/h3\x3e \x3cp\x3eSaiku is based upon the Microsoft MDX query language and will work on most JDBC compliant data sources. We also provide a number of connectors to NOSQL data sources.\x3c/p\x3e \x3ch3\x3eDynamic charting\x3c/h3\x3e \x3cp\x3eSaiku uses a flexible charting engine to provide a wide range of charts and graphs. These are all HTML \x26 Javascript only and don't require flash to be installed on the computer.\x3c/p\x3e \x3ch3\x3ePluggable visualisation engine\x3c/h3\x3e \x3cp\x3eSaiku Enterprise boasts a fully pluggable visualisation engine. This allows developers to build third party extensions and plug them into Saiku Enterprise to extend or replace the existing visualisations.\x3c/p\x3e \x3c/section\x3e \x3csection style\x3d'display:none !important;margin-top:50px' id\x3d'help'\x3e \x3ch1 class\x3d'saikulogo'\x3eSaiku\x3c/h1\x3e \x3ch2\x3eHelp\x3c/h2\x3e \x3cp\x3eWe provide Training, Consulting and Support to ensure you get the most from Saiku and your data. Our services cover all aspects of data analysis including data strategy, design, architecture, deployment and application/software support.\x3c/p\x3e \x3ctable style\x3d'margin-bottom:100px;'\x3e \x3ctr\x3e \x3cth\x3eTutorials\x3c/th\x3e\x3cth\x3eWiki\x3c/th\x3e \x3cth\x3eSupport\x3c/th\x3e \x3c/tr\x3e \x3ctr\x3e\x3ctd\x3eWe have a number of click through tutorials to help get your started: \x3cul\x3e\x3cli\x3e\x3ca href\x3d'#'  class\x3d'beg_tut'\x3eBeginners(Query building and charts)\x3c/a\x3e\x3c/li\x3e\x3c/ul\x3e \x3ctd\x3eWhy not try  our new \x3ca href\x3d'http://wiki.meteorite.bi' target\x3d'_blank'\x3eWiki site\x3c/a\x3e\x3cbr/\x3efor community documentation.\x3c/td\x3e \x3ctd\x3eIf you require more, \x3cbr/\x3e\x3ca href\x3d'mailto:info@meteorite.bi'\x3econtact us\x3c/a\x3e for support!.\x3c/td\x3e \x3c/tr\x3e \x3c/table\x3e \x3c/section\x3e \x3csection style\x3d'display:none !important;margin-top:50px' id\x3d'enterprise'\x3e \x3ch1 class\x3d'saikulogo'\x3eSaiku\x3c/h1\x3e \x3ch2\x3eEnterprise\x3c/h2\x3e \x3cp\x3eSaiku Enterprise is our fully supported and tested server and Pentaho plugin system. Buy Saiku Enterprise from as little as $15 per user per month and enjoy the addtional features Saiku Enterprise has to offer\x3c/p\x3e \x3cp\x3eTo find out more visit our \x3ca href\x3d'http://meteorite.bi' target\x3d'_blank'\x3esite\x3c/a\x3e or \x3ca href\x3d'mailto:info@meteorite.bi'\x3eschedule a call\x3c/a\x3e with one of us and we can show you why you should choose Saiku Enterprise!\x3c/p\x3e \x3c/section\x3e \x3c/section\x3e \x3c/div\x3e \x3c/div\x3e").html() ||"";
   console.log('starting...');
   //return _.template(a)({})
   Saiku.tabs.add(new Workspace);
   return !1
  },
  setupPage: function(a) {
   a = $(window).height();
   $("body").height(a);
   $(".stabs section").each(function() {
    $(this).height()
   });
   a = $("nav li.active a").attr("class");
   $("#" + a).fadeIn()
  },
  render: function() {
   new License;
   Settings.BIPLUGIN5 ? ($(this.el).html(this.template()), void 0 != Settings.LICENSE.licenseType && "trial" != Settings.LICENSE.licenseType && "Open Source License" != Settings.LICENSE.licenseType && $(this.el).find(".enterprisetoggle").css("visibility", "hidden"), this.getContent(), this.getNews(),
    this.setupPage(this), $("#splash").find("\x3e nav \x3e ul \x3e li.active \x3e a").click(function() {
     var a = $(this).attr("class");
     $("nav li").removeClass("active");
     $(this).parent().addClass("active");
     $(".stabs section").hide();
     $("#" + a).fadeIn()
    })) : ($(this.el).html(this.template()), void 0 != Settings.LICENSE.licenseType && "trial" != Settings.LICENSE.licenseType && "Open Source License" != Settings.LICENSE.licenseType && $(this.el).find(".enterprisetoggle").css("visibility", "hidden"), this.getContent(), this.getNews(),
    this.setupPage(this), $("#splash \x3e nav \x3e ul \x3e li.active \x3e a").click(function() {
     var a = $(this).attr("class");
     $("nav li").removeClass("active");
     $(this).parent().addClass("active");
     $(".stabs section").hide();
     $("#" + a).fadeIn()
    }));
   return this
  },
  remove: function() {
   $(this.el).remove()
  },
  caption: function(a) {
   return '\x3cspan class\x3d"i18n"\x3eHome\x3c/span\x3e'
  },
  getNews: function() {
   var a = this;
   $.ajax({
    type: "GET",
    url: "http://meteorite.bi/news.json",
    async: !1,
    contentType: "application/json",
    dataType: "jsonp",
    jsonpCallback: "jsonCallback",
    success: function(b) {
     for (var c = 0; c < b.item.length; c++) $(a.el).find("#news").append("\x3ch4 style\x3d'margin-left: 0.5%;color:#6D6E71;'\x3e" + b.item[c].title + "\x3c/h4\x3e\x3cstrong style\x3d'margin-left: 0.5%;color:#6D6E71;'\x3e" + b.item[c].date + "\x3c/strong\x3e\x3cbr/\x3e\x3cp style\x3d'color:#6D6E71;'\x3e" + b.item[c].body + "\x3c/p\x3e")
    },
    error: function(a) {
     console.log(a.message)
    }
   })
  },
  getContent: function() {
   var a = this;
   new License;
   $.ajax({
    type: "GET",
    url: "http://meteorite.bi/content.json",
    async: !1,
    contentType: "application/json",
    dataType: "jsonp",
    jsonpCallback: "jsonCallback2",
    cache: !0,
    success: function(b) {
     $(a.el).find("#dyn_content").html(b.item[0].content);
     $(a.el).find(".responsive-container").fitVids();
     $(self.el).html(a.template());
     "trial" != Settings.LICENSE.licenseType && "Open Source License" != Settings.LICENSE.licenseType && $(self.el).find(".enterprisetoggle").css("visibility", "hidden")
    },
    error: function(a) {
     $(self.el).html(self.template());
     "trial" != Settings.LICENSE.licenseType && "Open Source License" !=
      Settings.LICENSE.licenseType && $(self.el).find(".enterprisetoggle").css("visibility", "hidden")
    }
   })
  }
 }),
 SessionWorkspace = Backbone.Model.extend({
  initialize: function(a, b) {
   _.extend(this, Backbone.Events);
   _.bindAll(this, "process_datasources", "prefetch_dimensions");
   this.initialized = !1;
   this.first = !0;
   "undefined" !== typeof localStorage && localStorage && (Settings.LOCALSTORAGE_EXPIRATION && 0 !== Settings.LOCALSTORAGE_EXPIRATION || localStorage.clear(), localStorage.getItem("expiration") && localStorage.getItem("expiration") <=
    (new Date).getTime() ? localStorage.clear() : localStorage.getItem("saiku-version") && localStorage.getItem("saiku-version") === Settings.VERSION || (localStorage.clear(), localStorage.setItem("saiku-version", Settings.VERSION)));
   Saiku.ui.block("Loading datasources....");
   this.fetch({
    success: this.process_datasources
   }, {})
  },
  refresh: function() {
   "undefined" !== typeof localStorage && localStorage && localStorage.clear();
   this.clear();
   "undefined" !== typeof localStorage && localStorage && localStorage.setItem("saiku-version", Settings.VERSION);
   this.fetch({
    success: this.process_datasources
   }, {})
  },
  destroy: function() {
   "undefined" !== typeof localStorage && localStorage && localStorage.clear();
   return !1
  },
  render_default_tab: function(a, b) {
   null != b && b.unbind("report:rendered");
   for (var c = this, d = 0; d < a.length; d++)
    if (a[0].visible) {
     filePath = a[0].path;
     if (filePath.indexOf(".saiku") === filePath.length - 6) {
      Saiku.ui.block("Loading default report...");
      fileName = filePath.replace(/^.*[\\\/]/, "");
      var e = new SavedQuery({
        file: filePath,
        name: fileName
       }),
       d = {
        fileType: "saiku",
        name: fileName.split(".saiku")[0]
       },
       f = _.extend({
        file: e.get("file"),
        formatter: Settings.CELLSET_FORMATTER
       }, Settings.PARAMS),
       e = new Query(f, {
        name: e.get("name")
       }),
       d = new Workspace({
        query: e,
        item: d,
        viewState: null
       });
      Saiku.tabs.add(d);
      a.shift();
      d.bind("report:rendered", function() {
       c.render_default_tab(a)
      })
     } else filePath.indexOf(".sdb") === filePath.length - 4 && (Saiku.Dashboards ? (Saiku.ui.block("Loading default report..."), Saiku.tabs.add(new DashboardViewTab({
       file: a[d].path
      }))) : !Settings.INITIAL_QUERY && paramsURI.splash ? Saiku.tabs.add(new SplashScreen) :
      Settings.INITIAL_QUERY || Saiku.tabs.add(new Workspace));
     break
    } else a.shift()
  },
  process_datasources: function(a, b) {
   if ("undefined" !== typeof localStorage && localStorage && null === localStorage.getItem("session")) {
    localStorage.setItem("session", JSON.stringify(b));
    var c = (new Date).getTime() + Settings.LOCALSTORAGE_EXPIRATION;
    "undefined" !== typeof localStorage && localStorage && localStorage.setItem("expiration", c)
   }
   this.cube_navigation = _.template($("#template-cubes").html())({
    connections: b
   });
   this.cube = {};
   this.connections =
    b;
   _.delay(this.prefetch_dimensions, 20);
   if (this.initialized) Settings.INITIAL_QUERY || Saiku.tabs.add(new Workspace);
   else {
    $(Saiku.toolbar.el).prependTo($("#header"));
    $("#header").show();
    Saiku.ui.unblock();
    Saiku.tabs.render();
    Saiku.events.trigger("session:new", {
     session: this
    });
    var d = Saiku.URLParams.paramsURI();
    if (!_.has(d, "splash")) d.splash = !0;
    else if (_.has(d, "splash") && d.splash || _.has(d, "splash") && null === d.splash) d.splash = !0;
    if (Settings.DEFAULT_REPORT_SHOW) {
     var e = function() {
      var a, b;
      if (0 < _.size(Settings.DEFAULT_REPORTS) &&
       0 < k.length)
       for (b = 0; b < k.length; b++)
        if (k[0].visible) {
         a = k[0].path;
         if (a.indexOf(".saiku") === a.length - 6) {
          Saiku.ui.block("Loading default report...");
          b = a.replace(/^.*[\\\/]/, "");
          a = new SavedQuery({
           file: a,
           name: b
          });
          b = {
           fileType: "saiku",
           name: b.split(".saiku")[0]
          };
          var c = _.extend({
           file: a.get("file"),
           formatter: Settings.CELLSET_FORMATTER
          }, Settings.PARAMS);
          a = new Query(c, {
           name: a.get("name")
          });
          var e = new Workspace({
           query: a,
           item: b,
           viewState: null
          });
          Saiku.tabs.add(e);
          k.shift();
          e.bind("report:rendered", function() {
           h.render_default_tab(k,
            e)
          })
         } else a.indexOf(".sdb") === a.length - 4 && (Saiku.Dashboards ? (Saiku.ui.block("Loading default report..."), Saiku.tabs.add(new DashboardViewTab({
          file: k[b].path
         })), k.shift(), h.render_default_tab(k, null)) : !Settings.INITIAL_QUERY && d.splash ? Saiku.tabs.add(new SplashScreen) : Settings.INITIAL_QUERY || Saiku.tabs.add(new Workspace));
         break
        } else k.shift();
      else !Settings.INITIAL_QUERY && d.splash ? Saiku.tabs.add(new SplashScreen) : Settings.INITIAL_QUERY || Saiku.tabs.add(new Workspace)
     };
     !Settings.INITIAL_QUERY && d.splash ?
      Saiku.tabs.add(new SplashScreen) : Settings.INITIAL_QUERY || Saiku.tabs.add(new Workspace);
     var c = Settings.DEFAULT_REPORTS._,
      f = [];
     _.each(Saiku.session.roles, function(a) {
      a = Settings.DEFAULT_REPORTS[a];
      void 0 != a && 0 < a.length && (f = f.concat(a))
     });
     var g = 0,
      h = this,
      k = c.concat(Settings.DEFAULT_REPORTS[Saiku.session.username]).concat(f),
      g = setInterval(function() {
       "undefined" !== typeof window.DashboardViewTab && (clearInterval(g), e())
      }, 100)
    } else !Settings.INITIAL_QUERY && d.splash ? Saiku.tabs.add(new SplashScreen) : Settings.INITIAL_QUERY ||
     Saiku.tabs.add(new Workspace)
   }
  },
  prefetch_dimensions: function() {
   for (var a = 0, b = this.connections.length; a < b; a++)
    for (var c = this.connections[a], d = 0, e = c.catalogs.length; d < e; d++)
     for (var f = c.catalogs[d], g = 0, h = f.schemas.length; g < h; g++)
      for (var k = f.schemas[g], l = 0, m = k.cubes.length; l < m; l++) {
       var n = c.name + "/" + f.name + "/" + ("" === k.name || null === k.name ? "null" : k.name) + "/" + encodeURIComponent(k.cubes[l].name);
       "undefined" !== typeof localStorage && localStorage && null !== localStorage.getItem("cube." + n) ? this.cube[n] = new Cube(JSON.parse(localStorage.getItem("cube." +
        n))) : (this.cube[n] = new Cube({
        key: n
       }), !0 === Settings.DIMENSION_PREFETCH && this.cube[n].fetch())
      }!this.initialized && Backbone.history && (Backbone.history.start(), this.initialized = !0)
  },
  url: function() {
   return this.first ? (this.first = !1, encodeURI(Saiku.session.username + "/discover")) : encodeURI(Saiku.session.username + "/discover/refresh")
  }
 }),
 Member = Backbone.Model.extend({
  initialize: function(a, b) {
   this.cube = b.cube;
   var c = b.dimension.split("/");
   this.hierarchy = decodeURIComponent(c[0]);
   this.level = decodeURIComponent(c[1])
  },
  url: function() {
   return encodeURI(Saiku.session.username + "/discover/") + this.cube + "/hierarchies/" + encodeURIComponent(this.hierarchy) + "/levels/" + encodeURIComponent(this.level)
  }
 }),
 Plugin = Backbone.Model.extend({}),
 PluginCollection = Backbone.Collection.extend({
  model: Plugin,
  url: "info"
 }),
 SettingsOverride = Backbone.Model.extend({}),
 SettingsOverrideCollection = Backbone.Collection.extend({
  model: SettingsOverride,
  url: "info/ui-settings"
 }),
 License = Backbone.Model.extend({
  url: "api/license",
  initialize: function() {
   _.bindAll(this,
    "fetch_license")
  },
  fetch_license: function(a, b) {
   this.fetch({
    success: function(a) {
     b && "function" === typeof b && b({
      status: "success",
      data: a
     })
    },
    error: function(a) {
     b && "function" === typeof b && b({
      status: "error",
      data: a
     })
    }
   })
  }
 }),
 LicenseUserModel = Backbone.Model.extend({
  url: "api/license/users"
 }),
 LicenseUsersCollection = Backbone.Collection.extend({
  url: "api/license/users",
  model: LicenseUserModel
 }),
 LicenseQuota = Backbone.Model.extend({
  url: "api/license/quota",
  initialize: function() {
   _.bindAll(this, "fetch_quota")
  },
  fetch_quota: function(a,
   b) {
   this.fetch({
    success: function(a) {
     b && "function" === typeof b && b({
      status: "success",
      data: a
     })
    },
    error: function(a) {
     b && "function" === typeof b && b({
      status: "error",
      data: a
     })
    }
   })
  }
 }),
 Saiku = {
  toolbar: {},
  tabs: new TabSet,
  splash: new SplashScreen({
   toolbar: this.toolbar
  }),
  session: null,
  events: _.extend({}, Backbone.Events),
  routers: [],
  leaflet: "undefined" !== typeof L ? L : {},
  ui: {
   block: function(a) {
    $(".processing_message").html(a);
    $(".processing_message").removeClass("i18n_translated").addClass("i18n");
    Saiku.i18n.translate();
    $(".processing,.processing_container").show()
   },
   unblock: function() {
    $(".processing,.processing_container, .blockOverlay").hide();
    $(".blockUI").fadeOut("slow")
   }
  },
  log: function(a, b) {
   console && console.log && (console.log("Logging for: " + a), b && console.log(b))
  },
  error: function(a, b) {
   console && console.error && (console.error("Logging for: " + a), console.error(b))
  },
  URLParams: {
   buildValue: function(a) {
    return /^\s*$/.test(a) ? null : /^(true|false)$/i.test(a) ? "true" === a.toLowerCase() : isFinite(a) ? parseFloat(a) : a
   },
   paramsURI: function() {
    var a = {},
     b = window.location.search.substr(1).split("\x26"),
     c = b.length,
     d, e;
    if (1 < window.location.search.length)
     for (d = 0; d < c; d++) e = b[d].split("\x3d"), a[decodeURIComponent(e[0])] = 1 < e.length ? this.buildValue(decodeURIComponent(e[1])) : null;
    return a
   },
   equals: function() {
    var a = Array.prototype.slice.call(arguments),
     b = this.paramsURI();
    return _.isEqual(b, a[0]) ? !0 : !1
   }
  },
  loadCSS: function(a, b) {
   var c = window.document.createElement("link"),
    d = window.document.getElementsByTagName("script")[0];
   c.rel = "stylesheet";
   c.href = a;
   c.media = "only x";
   d.parentNode.insertBefore(c, d);
   setTimeout(function() {
    c.media =
     b || "all"
   });
   return c
  },
  loadJS: function(a, b) {
   var c = window.document.createElement("script"),
    d = window.document.getElementsByTagName("script")[0];
   c.src = a;
   c.async = !0;
   d.parentNode.insertBefore(c, d);
   b && "function" === typeof b && (c.onload = b);
   return c
  },
  toPattern: function(a, b) {
   var c = ("object" === typeof b ? b.pattern : b).split(""),
    d = a.toString().replace(/[^0-9a-zA-Z]/g, ""),
    e = 0,
    f = c.length,
    g;
   for (g = 0; g < f && !(e >= d.length); g++)
    if ("9" === c[g] && d[e].match(/[0-9]/) || "A" === c[g] && d[e].match(/[a-zA-Z]/) || "S" === c[g] && d[e].match(/[0-9a-zA-Z]/)) c[g] =
     d[e++];
    else if ("9" === c[g] || "A" === c[g] || "S" === c[g]) c = c.slice(0, g);
   return c.join("").substr(0, g)
  }
 };
Saiku.singleton = function() {
 var a;
 Saiku.singleton = function() {
  if (a) return a;
  a = this;
  this.set = function(a) {
   this.data = a
  };
  this.get = function() {
   return this.data
  }
 };
 return Saiku.singleton
}();
Backbone.emulateHTTP = !1;
Settings.BIPLUGIN || $(document).ready(function() {
 var a = new PluginCollection;
 a.fetch({
  success: function() {
   var b = new SettingsOverrideCollection;
   b.fetch({
    success: function() {
     var c = a.size(),
      d = 0;
     a.each(function(a) {
      d += 1;
      if ("js/saiku/plugins/I18n/plugin.js" != a.attributes.path) jQuery.ajax({
       async: !1,
       type: "GET",
       url: a.attributes.path,
       data: null,
       success: function() {
        if (d == c) {
         var a = b.size(),
          e = 0;
         b.each(function(b) {
          e += 1;
          for (var c in b.attributes) Settings[c] = b.attributes[c];
          void 0 != Settings.CSS && Saiku.loadCSS(Settings.CSS,
           null);
          a == e && (Saiku.session = new Session({}, {
           username: Settings.USERNAME,
           password: Settings.PASSWORD
          }), Saiku.toolbar = new Toolbar)
         })
        }
       },
       dataType: "script"
      });
      else if (d == c) {
       var f = b.size(),
        g = 0;
       b.each(function(a) {
        g += 1;
        for (var b in a.attributes) Settings[b] = a.attributes[b];
        void 0 != Settings.CSS && Saiku.loadCSS(Settings.CSS, null);
        f == g && (Saiku.session = new Session({}, {
         username: Settings.USERNAME,
         password: Settings.PASSWORD
        }), Saiku.toolbar = new Toolbar)
       })
      }
     })
    },
    error: function() {
     var b = a.size(),
      d = 0;
     a.each(function(a) {
      d += 1;
      "js/saiku/plugins/I18n/plugin.js" != a.attributes.path ? jQuery.ajax({
       async: !1,
       type: "GET",
       url: a.attributes.path,
       data: null,
       success: function() {
        d == b && (void 0 != Settings.CSS && Saiku.loadCSS(Settings.CSS, null), Saiku.session = new Session({}, {
         username: Settings.USERNAME,
         password: Settings.PASSWORD
        }), Saiku.toolbar = new Toolbar)
       },
       dataType: "script"
      }) : d == b && (void 0 != Settings.CSS && Saiku.loadCSS(Settings.CSS, null), Saiku.session = new Session({}, {
       username: Settings.USERNAME,
       password: Settings.PASSWORD
      }), Saiku.toolbar = new Toolbar)
     })
    }
   })
  }
 })
});
var SaikuTimeLogger = function(a) {
 this._element = $(a);
 this._timestamps = [];
 this._events = []
};
SaikuTimeLogger.prototype.log = function(a) {
 var b = (new Date).getTime();
 a || (a = "Unknown");
 if (0 < this._timestamps.length) {
  var c = this._timestamps[this._timestamps.length - 1];
  1 < b - c && this._element.append("\x3cdiv\x3e" + (b - c) + " ms " + a + "  (previous: " + this._events[this._events.length - 1] + " )\x3c/div\x3e")
 }
 this._timestamps.push(b);
 this._events.push(a)
};
var DateFilterModal = Modal.extend({
  type: "date-filter",
  buttons: [{
   text: "Clear",
   method: "clear_date_filter"
  }, {
   text: "Save",
   method: "save"
  }, {
   text: "Open Standard Filter",
   method: "open_standard_filter"
  }, {
   text: "Cancel",
   method: "finished"
  }, {
   text: "Help",
   method: "help"
  }],
  events: {
   "click a": "call",
   "focus .selection-date": "selection_date",
   "click .selection-radio": "disable_divselections",
   "click .operator-radio": "show_fields",
   "click #add-date": "add_selected_date",
   "click .del-date": "del_selected_date"
  },
  template_days_mdx: "Filter({parent}.Members, {parent}.CurrentMember.NAME {comparisonOperator} '{dates}'",
  template_many_years_mdx: " {logicalOperator} {parent}.CurrentMember.NAME {comparisonOperator} '{dates}'",
  template_mdx: "IIF(ISEMPTY(CurrentDateMember([{dimension}.{hierarchy}], '[\"{dimension}.{hierarchy}\"]\\.{analyzerDateFormat}', EXACT)), {}, { {parent} CurrentDateMember([{dimension}.{hierarchy}], '[\"{dimension}.{hierarchy}\"]\\.{analyzerDateFormat}', EXACT)})",
  template_last_mdx: "{parent} LastPeriods({periodAmount}, CurrentDateMember([{dimension}.{hierarchy}], '[\"{dimension}.{hierarchy}\"]\\.{analyzerDateFormat}', EXACT))",
  template_dialog: _.template('\x3cdiv class\x3d"box-selections"\x3e\x3cdiv class\x3d"selection-option"\x3e\x3cinput type\x3d"radio" class\x3d"selection-radio" name\x3d"selection-radio" id\x3d"selection-radio-operator" level-type\x3d"TIME_DAYS" disabled\x3e\x3c/div\x3e\x3cdiv class\x3d"available-selections" selection-name\x3d"operator" available\x3d"false"\x3e\x3cspan class\x3d"i18n"\x3eOperator:\x3c/span\x3e\x3cbr\x3e\x3cdiv class\x3d"selection-options"\x3e\x3cdiv class\x3d"form-group-selection"\x3e\x3clabel\x3e\x3cinput type\x3d"radio" name\x3d"operator-radio" class\x3d"operator-radio" id\x3d"op-equals" value\x3d"\x3d" data-operator\x3d"equals"\x3e \x3cspan class\x3d"i18n"\x3eEquals\x3c/span\x3e\x3c/label\x3e\x3c/div\x3e\x3cdiv class\x3d"form-group-selection"\x3e\x3clabel\x3e\x3cinput type\x3d"radio" name\x3d"operator-radio" class\x3d"operator-radio" id\x3d"op-after" value\x3d"\x3e" data-operator\x3d"after"\x3e \x3cspan class\x3d"i18n"\x3eAfter\x3c/span\x3e\x3c/label\x3e\x3c/div\x3e\x3cdiv class\x3d"form-group-selection"\x3e\x3clabel\x3e\x3cinput type\x3d"radio" name\x3d"operator-radio" class\x3d"operator-radio" id\x3d"op-before" value\x3d"\x3c" data-operator\x3d"before"\x3e \x3cspan class\x3d"i18n"\x3eBefore\x3c/span\x3e\x3c/label\x3e\x3c/div\x3e\x3cdiv class\x3d"form-group-selection"\x3e\x3clabel\x3e\x3cinput type\x3d"radio" name\x3d"operator-radio" class\x3d"operator-radio" id\x3d"op-between" value\x3d"\x3e\x3d|\x3c\x3d" data-operator\x3d"between"\x3e \x3cspan class\x3d"i18n"\x3eBetween\x3c/span\x3e\x3c/label\x3e\x3cbr\x3e\x3c/div\x3e\x3cdiv class\x3d"form-group-selection"\x3e\x3clabel\x3e\x3cinput type\x3d"radio" name\x3d"operator-radio" class\x3d"operator-radio" id\x3d"op-different" value\x3d"\x3c\x3e" data-operator\x3d"different"\x3e \x3cspan class\x3d"i18n"\x3eDifferent\x3c/span\x3e\x3c/label\x3e\x3c/div\x3e\x3cdiv class\x3d"form-group-selection"\x3e\x3clabel\x3e\x3cinput type\x3d"radio" name\x3d"operator-radio" class\x3d"operator-radio" id\x3d"op-after-equals" value\x3d"\x3e\x3d" data-operator\x3d"after\x26equals"\x3e \x3cspan class\x3d"i18n"\x3eAfter\x26amp;Equals\x3c/span\x3e\x3c/label\x3e\x3c/div\x3e\x3cdiv class\x3d"form-group-selection"\x3e\x3clabel\x3e\x3cinput type\x3d"radio" name\x3d"operator-radio" class\x3d"operator-radio" id\x3d"op-before-equals" value\x3d"\x3c\x3d" data-operator\x3d"before\x26equals"\x3e \x3cspan class\x3d"i18n"\x3eBefore\x26amp;Equals\x3c/span\x3e\x3c/label\x3e\x3c/div\x3e\x3cdiv class\x3d"form-group-selection"\x3e\x3clabel\x3e\x3cinput type\x3d"radio" name\x3d"operator-radio" class\x3d"operator-radio" id\x3d"op-notbetween" value\x3d"\x3e\x3d||\x3c\x3d" data-operator\x3d"notbetween"\x3e \x3cspan class\x3d"i18n"\x3eNot Between\x3c/span\x3e\x3c/label\x3e\x3cbr\x3e\x3c/div\x3e\x3cdiv class\x3d"inline-form-group"\x3e\x3cdiv class\x3d"form-group" id\x3d"div-selection-date" hidden\x3e\x3clabel class\x3d"i18n"\x3eSelect a date:\x3c/label\x3e\x3cinput type\x3d"text" class\x3d"selection-date" id\x3d"selection-date" placeholder\x3d"Choose a date"\x3e\x3ca class\x3d"form_button i18n" id\x3d"add-date"\x3eadd\x3c/a\x3e\x3c/div\x3e\x3cdiv class\x3d"form-group" id\x3d"div-selected-date" hidden\x3e\x3cfieldset\x3e\x3clegend class\x3d"i18n"\x3eSelected date:\x3c/legend\x3e\x3cul id\x3d"selected-date"\x3e\x3c/ul\x3e\x3c/fieldset\x3e\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"form-group" id\x3d"div-select-start-date" hidden\x3e\x3clabel class\x3d"i18n"\x3eSelect a start date:\x3c/label\x3e\x3cinput type\x3d"text" class\x3d"selection-date" id\x3d"start-date" placeholder\x3d"Choose a date"\x3e\x3c/div\x3e\x3cdiv class\x3d"form-group" id\x3d"div-select-end-date" hidden\x3e\x3clabel class\x3d"i18n"\x3eSelect an end date:\x3c/label\x3e\x3cinput type\x3d"text" class\x3d"selection-date" id\x3d"end-date" placeholder\x3d"Choose a date"\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"box-selections"\x3e\x3cdiv class\x3d"selection-option"\x3e\x3cinput type\x3d"radio" class\x3d"selection-radio" name\x3d"selection-radio" id\x3d"selection-radio-fixed-date"\x3e\x3c/div\x3e\x3cdiv class\x3d"available-selections" selection-name\x3d"fixed-date" available\x3d"false"\x3e\x3cspan class\x3d"i18n"\x3eFixed Date:\x3c/span\x3e\x3cbr\x3e\x3cdiv class\x3d"selection-options"\x3e\x3cdiv class\x3d"form-group-selection"\x3e\x3clabel\x3e\x3cinput type\x3d"radio" name\x3d"fixed-radio" id\x3d"fd-yesterday" data-leveltype\x3d"TIME_DAYS"\x3e \x3cspan class\x3d"i18n"\x3eYesterday\x3c/span\x3e\x3c/label\x3e\x3c/div\x3e\x3cdiv class\x3d"form-group-selection"\x3e\x3clabel\x3e\x3cinput type\x3d"radio" name\x3d"fixed-radio" id\x3d"fd-today" data-leveltype\x3d"TIME_DAYS"\x3e \x3cspan class\x3d"i18n"\x3eToday\x3c/span\x3e\x3c/label\x3e\x3c/div\x3e\x3cdiv class\x3d"form-group-selection"\x3e\x3clabel\x3e\x3cinput type\x3d"radio" name\x3d"fixed-radio" id\x3d"fd-week" data-leveltype\x3d"TIME_WEEKS"\x3e \x3cspan class\x3d"i18n"\x3eCurrent Week\x3c/span\x3e\x3c/label\x3e\x3c/div\x3e\x3cdiv class\x3d"form-group-selection"\x3e\x3clabel\x3e\x3cinput type\x3d"radio" name\x3d"fixed-radio" id\x3d"fd-month" data-leveltype\x3d"TIME_MONTHS"\x3e \x3cspan class\x3d"i18n"\x3eCurrent Month\x3c/span\x3e\x3c/label\x3e\x3c/div\x3e\x3cdiv class\x3d"form-group-selection"\x3e\x3clabel\x3e\x3cinput type\x3d"radio" name\x3d"fixed-radio" id\x3d"fd-quarter" data-leveltype\x3d"TIME_QUARTERS"\x3e \x3cspan class\x3d"i18n"\x3eCurrent Quarter\x3c/span\x3e\x3c/label\x3e\x3cbr\x3e\x3c/div\x3e\x3cdiv class\x3d"form-group-selection"\x3e\x3clabel\x3e\x3cinput type\x3d"radio" name\x3d"fixed-radio" id\x3d"fd-year" data-leveltype\x3d"TIME_YEARS"\x3e \x3cspan class\x3d"i18n"\x3eCurrent Year\x3c/span\x3e\x3c/label\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e\x3cdiv class\x3d"box-selections"\x3e\x3cdiv class\x3d"selection-option"\x3e\x3cinput type\x3d"radio" class\x3d"selection-radio" name\x3d"selection-radio" id\x3d"selection-radio-available"\x3e\x3c/div\x3e\x3cdiv class\x3d"available-selections" selection-name\x3d"rolling-date" available\x3d"false"\x3e\x3cspan class\x3d"i18n"\x3eRolling Date:\x3c/span\x3e\x3cbr\x3e\x3cdiv class\x3d"selection-options"\x3e\x3cdiv class\x3d"form-group-rolling"\x3e\x3cselect\x3e\x3coption class\x3d"i18n" value\x3d"last"\x3eLast\x3c/option\x3e\x3coption class\x3d"keep-disabled i18n" value\x3d"next" disabled\x3eNext\x3c/option\x3e\x3c/select\x3e\x3c/div\x3e\x3cdiv class\x3d"form-group-rolling"\x3e\x3cinput type\x3d"text" id\x3d"date-input"\x3e\x3c/div\x3e\x3cdiv class\x3d"form-group-rolling"\x3e\x3cselect id\x3d"period-select"\x3e\x3coption name\x3d"TIME_DAYS" class\x3d"i18n" id\x3d"rd-days"\x3eDay(s)\x3c/option\x3e\x3coption name\x3d"TIME_WEEKS" class\x3d"i18n" id\x3d"rd-weeks"\x3eWeek(s)\x3c/option\x3e\x3coption name\x3d"TIME_MONTHS" class\x3d"i18n" id\x3d"rd-months"\x3eMonth(s)\x3c/option\x3e\x3coption name\x3d"TIME_YEARS" class\x3d"i18n" id\x3d"rd-years"\x3eYear(s)\x3c/option\x3e\x3c/select\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e\x3c/div\x3e'),
  initialize: function(a) {
   _.extend(this, a);
   this.options.title = "Date Filter";
   this.message = "Loading...";
   this.query = a.workspace.query;
   this.selectedDates = [];
   this.levelInfo = {
    cube: this.get_cube_name(),
    dimension: this.dimension,
    hierarchy: this.hierarchy,
    name: this.name
   };
   _.bindAll(this, "finished");
   this.bind("open", this.post_render);
   this.render();
   this.show_button_clear() ? (this.$el.find(".dialog_footer a:nth-child(1)").show(), this.$el.find(".dialog_footer a:nth-child(3)").hide()) : this.$el.find(".dialog_footer a:nth-child(1)").hide();
   this.$el.parent().find(".ui-dialog-titlebar-close").bind("click", this.finished);
   this.member = new Member({}, {
    cube: this.workspace.selected_cube,
    dimension: this.key
   });
   this.$el.find(".dialog_body").html(this.template_dialog);
   this.$el.find(".available-selections *").prop("disabled", !0).off("click");
   this.dataLevels = this.save_data_levels();
   this.check_saikuDayFormatString();
   this.add_values_fixed_date();
   this.add_values_last_periods();
   this.populate();
   Saiku.i18n.translate()
  },
  help: function(a) {
   a.preventDefault();
   window.open("http://wiki.meteorite.bi/display/SAIK/Advanced+Date+Filtering")
  },
  open_standard_filter: function(a) {
   a.preventDefault();
   (new SelectionsModal({
    source: "DateFilterModal",
    target: this.target,
    name: this.name,
    key: this.key,
    objDateFilter: {
     dimension: this.dimension,
     hierarchy: this.hierarchy,
     data: this.data,
     analyzerDateFormat: this.analyzerDateFormat,
     dimHier: this.dimHier
    },
    workspace: this.workspace
   })).open();
   this.$el.dialog("destroy").remove()
  },
  post_render: function(a) {
   var b = ($(window).width() - 600) / 2,
    c = 600 >
    $(window).width() ? $(window).width() : 600;
   $(a.modal.el).parents(".ui-dialog").css({
    width: c,
    left: "inherit",
    margin: "0",
    height: 490
   }).offset({
    left: b
   })
  },
  check_saikuDayFormatString: function() {
   var a = this;
   this.$el.find(".selection-radio").each(function(b, c) {
    _.find(a.dataLevels, function(b) {
     a.name === b.name && b.saikuDayFormatString && $(c).prop("disabled", !1)
    })
   })
  },
  show_fields: function(a) {
   a = a.type ? $(a.currentTarget) : $(a);
   var b = a.data("operator");
   if (void 0 !== b) switch (b) {
    case "equals":
    case "different":
     a.closest(".selection-options").find("#div-selection-date").show();
     a.closest(".selection-options").find("#div-selected-date").show();
     a.closest(".selection-options").find("#div-select-start-date").hide();
     a.closest(".selection-options").find("#div-select-end-date").hide();
     a.closest(".selection-options").find("#add-date").show();
     this.clear_operators();
     break;
    case "after":
    case "after\x26equals":
    case "before":
    case "before\x26equals":
     a.closest(".selection-options").find("#div-selection-date").show();
     a.closest(".selection-options").find("#div-selected-date").hide();
     a.closest(".selection-options").find("#div-select-start-date").hide();
     a.closest(".selection-options").find("#div-select-end-date").hide();
     a.closest(".selection-options").find("#add-date").hide();
     this.clear_operators();
     break;
    case "between":
    case "notbetween":
     a.closest(".selection-options").find("#div-selection-date").hide();
     a.closest(".selection-options").find("#div-selected-date").hide();
     a.closest(".selection-options").find("#div-select-start-date").show();
     a.closest(".selection-options").find("#div-select-end-date").show();
     a.closest(".selection-options").find("#add-date").hide();
     this.clear_operators();
     break;
    default:
     a.closest(".selection-options").find("#div-selection-date").hide(), a.closest(".selection-options").find("#div-selected-date").hide(), a.closest(".selection-options").find("#div-select-start-date").hide(), a.closest(".selection-options").find("#div-select-end-date").hide(), a.closest(".selection-options").find("#add-date").hide(), this.clear_operators()
   } else this.$el.find(".selection-options").find("#div-selection-date").hide(), this.$el.find(".selection-options").find("#div-selected-date").hide(),
    this.$el.find(".selection-options").find("#div-select-start-date").hide(), this.$el.find(".selection-options").find("#div-select-end-date").hide(), this.$el.find(".selection-options").find("#add-date").hide(), this.clear_operators()
  },
  save_data_levels: function() {
   var a = this,
    b = [];
   _.each(this.data.hierarchies.levels, function(c, d, e) {
    if (void 0 !== e[d].annotations.AnalyzerDateFormat || void 0 !== e[d].annotations.SaikuDayFormatString) void 0 !== e[d].annotations.AnalyzerDateFormat ? b.push({
     name: e[d].name,
     analyzerDateFormat: e[d].annotations.AnalyzerDateFormat.replace(/[.]/gi,
      "\\."),
     levelType: e[d].levelType,
     saikuDayFormatString: e[d].annotations.SaikuDayFormatString || ""
    }) : b.push({
     name: e[d].name,
     analyzerDateFormat: "",
     levelType: e[d].levelType,
     saikuDayFormatString: e[d].annotations.SaikuDayFormatString || ""
    }), e[d].annotations.SaikuDayFormatString && (a.saikuDayFormatString = e[d].annotations.SaikuDayFormatString)
   });
   return b
  },
  add_values_fixed_date: function() {
   var a = this;
   this.$el.find(".available-selections").each(function(b, c) {
    "fixed-date" === $(c).attr("selection-name") && ($(c).find("input:radio").each(function(b,
     c) {
     var f = $(c).data("leveltype");
     _.find(a.dataLevels, function(b, d) {
      f === b.levelType ? $(c).val(a.dataLevels[d].analyzerDateFormat) : "yesterday" !== f && "today" !== f || b.name !== a.name || _.isEmpty(a.dataLevels[d].analyzerDateFormat) || void 0 === a.dataLevels[d].analyzerDateFormat || null === a.dataLevels[d].analyzerDateFormat || "TIME_DAYS" !== a.dataLevels[d].levelType || $(c).val(a.dataLevels[d].analyzerDateFormat)
     })
    }), $(c).find("input:radio").each(function(a, b) {
     null !== $(b).val() && void 0 !== $(b).val() && "" !== $(b).val() && "on" !==
      $(b).val() || $(b).addClass("keep-disabled")
    }))
   })
  },
  add_values_last_periods: function() {
   var a = this;
   this.$el.find(".available-selections").each(function(b, c) {
    "rolling-date" === $(c).attr("selection-name") && ($(c).find("#period-select \x3e option").each(function(b, c) {
     var f = $(c).attr("name");
     _.find(a.dataLevels, function(b, d) {
      f === b.levelType && $(c).val(a.dataLevels[d].analyzerDateFormat)
     })
    }), $(c).find("#period-select \x3e option").each(function(a, b) {
     null !== $(b).attr("value") && void 0 !== $(b).attr("value") && "" !==
      $(b).attr("value") || $(b).addClass("keep-disabled")
    }))
   })
  },
  selection_date: function(a) {
   a = $(a.currentTarget);
   var b = this.saikuDayFormatString.replace(/yyyy/gi, "yy");
   a.datepicker({
    dateFormat: b
   })
  },
  clear_selections: function(a) {
   this.show_fields(a);
   this.$el.find('input[type\x3d"text"]').val("");
   this.$el.find("select").prop("selectedIndex", 0);
   this.$el.find("#selected-date").empty();
   this.$el.find(".available-selections *").prop("checked", !1);
   this.selectedDates = []
  },
  clear_operators: function() {
   this.$el.find('input[type\x3d"text"]').val("");
   this.$el.find("#selected-date").empty();
   this.selectedDates = []
  },
  disable_divselections: function(a) {
   var b = Array.prototype.slice.call(arguments),
    c = a.type ? $(a.currentTarget) : $(a);
   b[1] || this.clear_selections(a);
   this.$el.find(".available-selections").attr("available", !1);
   this.$el.find(".available-selections *").prop("disabled", !0).off("click");
   c.closest(".box-selections").find(".available-selections").attr("available", !0);
   c.closest(".box-selections").find(".available-selections *:not(.keep-disabled)").prop("disabled", !1).on("click");
   a.type && c.closest(".box-selections").find("select").each(function(a, b) {
    $(b).find("option:not([disabled])").first().attr("selected", "selected")
   })
  },
  day_format_string: function() {
   var a = this.saikuDayFormatString;
   return a = a.replace(/[a-zA-Z]/gi, "9")
  },
  add_selected_date: function(a) {
   a.preventDefault();
   var b = $(a.currentTarget),
    c = this.day_format_string();
   a = this.$el.find("#selection-date");
   b = b.closest(".inline-form-group").find("#div-selected-date").find("#selected-date");
   "" !== a.val() ? (c = Saiku.toPattern(a.val(),
    c), a.css("border", "1px solid #ccc"), b.append($("\x3cli\x3e\x3c/li\x3e").text(c).append('\x3ca href\x3d"#" class\x3d"del-date" data-date\x3d"' + c + '"\x3ex\x3c/a\x3e')), this.selectedDates.push(c)) : a.css("border", "1px solid red");
   a.val("")
  },
  del_selected_date: function(a) {
   a.preventDefault();
   a = $(a.currentTarget);
   var b = a.data("date");
   this.selectedDates = _.without(this.selectedDates, b);
   a.parent().remove()
  },
  populate: function() {
   var a = this.get_date_filter(),
    b;
   if (a && !_.isEmpty(a))
    if ("operator" === a.type) {
     var c = this.$el.find("#" +
       a.checked),
      d = c.data("operator"),
      e = this;
     b = this.$el.find("#selection-radio-operator");
     b.prop("checked", !0);
     c.prop("checked", !0);
     this.disable_divselections(b, !0);
     this.show_fields(c);
     this.selectedDates = a.values;
     "after" === d || "after\x26equals" === d || "before" === d || "before\x26equals" === d ? this.$el.find("#selection-date").val(this.selectedDates[0]) : "between" === d ? (e.$el.find("#start-date").val(this.selectedDates[0]), e.$el.find("#end-date").val(this.selectedDates[1])) : "notbetween" === d ? (e.$el.find("#start-date").val(this.selectedDates[0]),
      e.$el.find("#end-date").val(this.selectedDates[1])) : _.each(this.selectedDates, function(a, b) {
      e.$el.find("#selected-date").append($("\x3cli\x3e\x3c/li\x3e").text(a).append('\x3ca href\x3d"#" class\x3d"del-date" data-date\x3d"' + a + '"\x3ex\x3c/a\x3e'))
     })
    } else "fixed-date" === a.type ? (b = this.$el.find("#selection-radio-fixed-date"), b.prop("checked", !0), this.$el.find("#" + a.checked).prop("checked", !0)) : (b = this.$el.find("#selection-radio-available"), b.prop("checked", !0), this.$el.find("#date-input").val(a.periodAmount),
     this.$el.find('select#period-select option[id\x3d"' + a.periodSelect + '"]').prop("selected", !0)), this.disable_divselections(b, !0)
  },
  populate_mdx: function(a, b, c) {
   a.tagdim = a.dimension.replace(/m/g, "\\m").replace(/y/g, "\\y").replace(/q/g, "\\q").replace(/d/g, "\\d");
   a.taghier = a.hierarchy.replace(/m/g, "\\m").replace(/y/g, "\\y").replace(/q/g, "\\q").replace(/d/g, "\\d");
   a.workinglevel !== a.level && void 0 !== a.workinglevel ? (a.parent = "[{dimension}.{hierarchy}].[{level}].members,", a.parent = a.parent.replace(/{(\w+)}/g,
    function(b, c) {
     return a[c]
    })) : a.parent = "";
   this.template_mdx = this.template_mdx.replace(/{(\w+)}/g, function(b, c) {
    return a[c]
   });
   if ("dayperiods" === b) {
    a.parent = "[{dimension}.{hierarchy}].[{level}]";
    a.parent = a.parent.replace(/{(\w+)}/g, function(b, c) {
     return a[c]
    });
    if (1 < this.selectedDates.length) {
     b = this.selectedDates.length;
     for (c = 0; c < b; c++)
      if (a.dates = this.selectedDates[c], "\x3e\x3d|\x3c\x3d" === a.comparisonOperator) 0 === c ? (a.comparisonOperator = a.comparisonOperator.split("|")[0], this.template_days_mdx = this.template_days_mdx.replace(/{(\w+)}/g,
       function(b, c) {
        return a[c]
       }), a.comparisonOperator = "\x3e\x3d|\x3c\x3d") : (a.logicalOperator = "AND", a.comparisonOperator = a.comparisonOperator.split("|")[1], this.template_days_mdx += this.template_many_years_mdx.replace(/{(\w+)}/g, function(b, c) {
       return a[c]
      }));
      else if ("\x3e\x3d||\x3c\x3d" === a.comparisonOperator)
      if (0 === c) this.template_days_mdx = "EXCEPT({parent}.Members, " + this.template_days_mdx, a.comparisonOperator = a.comparisonOperator.split("||")[0], this.template_days_mdx = this.template_days_mdx.replace(/{(\w+)}/g,
       function(b, c) {
        return a[c]
       }), a.comparisonOperator = "\x3e\x3d||\x3c\x3d";
      else return a.logicalOperator = "AND", a.comparisonOperator = a.comparisonOperator.split("||")[1], this.template_days_mdx += this.template_many_years_mdx.replace(/{(\w+)}/g, function(b, c) {
       return a[c]
      }), this.template_days_mdx + "))";
     else 0 === c ? this.template_days_mdx = this.template_days_mdx.replace(/{(\w+)}/g, function(b, c) {
      return a[c]
     }) : (a.logicalOperator = "\x3c\x3e" === a.comparisonOperator ? "AND" : "OR", this.template_days_mdx += this.template_many_years_mdx.replace(/{(\w+)}/g,
      function(b, c) {
       return a[c]
      }));
     return this.template_days_mdx + ")"
    }
    a.dates = this.selectedDates[0];
    return this.template_days_mdx = this.template_days_mdx.replace(/{(\w+)}/g, function(b, c) {
     return a[c]
    }) + ")"
   }
   return "lastperiods" === b ? this.template_last_mdx = this.template_last_mdx.replace(/{(\w+)}/g, function(b, c) {
    return a[c]
   }) : "yesterday" !== b ? this.template_mdx : this.template_mdx + ".lag(1)"
  },
  save: function(a) {
   a.preventDefault();
   a = $("\x3cdiv\x3eSaving...\x3c/div\x3e");
   $(this.el).find(".dialog_body").children().hide();
   $(this.el).find(".dialog_body").prepend(a);
   var b = this,
    c, d, e, f, g = null,
    h = {};
   if (null === b.hierarchy || void 0 === b.hierarchy) b.hierarchy = b.dimension;
   this.$el.find(".available-selections").each(function(a, k) {
    if ("true" === $(k).attr("available")) {
     h.type = $(k).attr("selection-name");
     "operator" === $(k).attr("selection-name") ? $(k).find("input:radio").each(function(a, e) {
       if (!0 === $(e).is(":checked")) {
        var f = $(e).data("operator");
        h.checked = $(e).attr("id");
        if ("after" === f || "after\x26equals" === f || "before" === f || "before\x26equals" ===
         f) b.selectedDates = [], b.selectedDates.push(b.$el.find("#selection-date").val());
        else if ("between" === f || "notbetween" === f) b.selectedDates = [], b.selectedDates.push(b.$el.find("#start-date").val()), b.selectedDates.push(b.$el.find("#end-date").val());
        c = "dayperiods";
        d = $(e).val();
        h.values = b.selectedDates
       }
      }) : "fixed-date" === $(k).attr("selection-name") ? $(k).find("input:radio").each(function(a, b) {
       !0 === $(b).is(":checked") && (c = $(b).attr("id").split("-")[1], e = $(b).val(), h.checked = $(b).attr("id"))
      }) : "rolling-date" ===
      $(k).attr("selection-name") && (e = $("#period-select").find(":selected").val(), c = "lastperiods", f = $(k).find("input:text").val(), h.fixedDateName = c, h.periodAmount = $(k).find("input:text").val(), h.periodSelect = $("#period-select").find(":selected").attr("id"));
     var l = b.dataLevels.length,
      q, t;
     for (t = 0; t < l; t++) b.dataLevels[t].analyzerDateFormat === e && (q = b.dataLevels[t].name);
     l = {
      dimension: b.dimension,
      hierarchy: b.hierarchy,
      level: b.name,
      analyzerDateFormat: e,
      periodAmount: f,
      comparisonOperator: d,
      workinglevel: q
     };
     g = "dayperiods" ===
      c && "" !== b.selectedDates[0] && void 0 !== b.selectedDates[0] || "lastperiods" === c && !_.isEmpty(e) && "Day(s)" !== e && !_.isEmpty(f) || "dayperiods" !== c && "lastperiods" !== c && !_.isEmpty(e) ? b.populate_mdx(l, c) : null
    }
   });
   var k = decodeURIComponent(this.member.hierarchy);
   a = decodeURIComponent(this.member.level);
   k = this.workspace.query.helper.getHierarchy(k);
   this.get_cube_name();
   _.extend(h, this.levelInfo);
   if ("dayperiods" === c && "" !== this.selectedDates[0] && void 0 !== b.selectedDates[0] || "lastperiods" === c && !_.isEmpty(e) && "Day(s)" !==
    e && !_.isEmpty(f) || "dayperiods" !== c && "lastperiods" !== c && !_.isEmpty(e)) this.set_date_filter(h);
   else {
    var l = this.get_uuid(h);
    this.workspace.dateFilter.remove(l);
    this.workspace.query.setProperty("saiku.ui.datefilter.data", this.workspace.dateFilter.toJSON())
   }
   k && k.levels.hasOwnProperty(a) && (k.levels[a] = {
    mdx: g,
    name: a
   });
   this.finished()
  },
  get_cube_name: function() {
   return decodeURIComponent(this.workspace.selected_cube.split("/")[3])
  },
  get_uuid: function(a) {
   return "[" + a.cube + "]." + this.dimHier + ".[" + a.name + "]"
  },
  set_date_filter: function(a) {
   var b =
    this.workspace.dateFilter,
    c = b.toJSON(),
    d = this.get_uuid(a);
   a.id = d;
   a.key = this.key;
   c && !_.isEmpty(c) ? b.get(d) ? (b = b.get(d), b.set(a)) : b.add(a) : b.add(a);
   this.workspace.query.setProperty("saiku.ui.datefilter.data", b.toJSON())
  },
  get_date_filter: function() {
   var a = {
     cube: this.get_cube_name(),
     dimension: this.dimension,
     hierarchy: this.hierarchy,
     name: this.name
    },
    a = this.get_uuid(a);
   return a = (a = this.workspace.dateFilter.get(a)) ? a.toJSON() : []
  },
  clear_date_filter: function(a) {
   a.preventDefault();
   this.workspace.dateFilter.toJSON();
   var b;
   b = this.get_uuid(this.levelInfo);
   var c = decodeURIComponent(this.member.hierarchy),
    d = decodeURIComponent(this.member.level);
   (c = this.workspace.query.helper.getHierarchy(c)) && c.levels.hasOwnProperty(d) && (c.levels[d] = {
    mdx: null,
    name: d
   });
   this.workspace.dateFilter.remove(b);
   this.workspace.query.setProperty("saiku.ui.datefilter.data", this.workspace.dateFilter.toJSON());
   this.clear_selections(a);
   this.finished()
  },
  show_button_clear: function() {
   var a = this.workspace.dateFilter,
    b = a.toJSON(),
    c;
   c = this.get_uuid(this.levelInfo);
   return b && !_.isEmpty(b) ? a.get(c) ? !0 : !1 : !1
  },
  finished: function(a) {
   this.$el.dialog("destroy").remove();
   a || this.query.run()
  }
 }),
 DateFilterObserver = Backbone.View.extend({
  initialize: function(a) {
   this.workspace = a.workspace;
   _.bindAll(this, "receive_data", "workspace_levels");
   this.workspace.bind("query:result", this.receive_data);
   Saiku.session.bind("dimensionList:select_dimension", this.receive_data);
   Saiku.session.bind("workspaceDropZone:select_dimension", this.receive_data);
   Saiku.session.bind("workspaceDropZone:clear_axis",
    this.receive_data)
  },
  receive_data: function(a) {
   var b = this.workspace.dateFilter.toJSON();
   this.check_dateFilter_saved();
   if (b && !_.isEmpty(b)) return _.delay(this.workspace_levels, 1E3, a)
  },
  get_cube_name: function() {
   return decodeURIComponent(this.workspace.selected_cube.split("/")[3])
  },
  workspace_levels: function(a) {
   a = this.get_cube_name();
   var b = this.workspace.query.helper.getAxis("COLUMNS"),
    c = this.workspace.query.helper.getAxis("ROWS"),
    d = this.workspace.query.helper.getAxis("FILTER"),
    e = [];
   "COLUMNS" === b.location &&
    0 < b.hierarchies.length && e.push(this.get_axes(a, b));
   "ROWS" === c.location && 0 < c.hierarchies.length && e.push(this.get_axes(a, c));
   "FILTER" === d.location && 0 < d.hierarchies.length && e.push(this.get_axes(a, d));
   e = _.compact(_.union(e[0], e[1], e[2]));
   this.check_dateFilter_model(e)
  },
  get_axes: function(a, b) {
   var c = [],
    d = b.hierarchies.length,
    e;
   for (e = 0; e < d; e++)
    for (var f in b.hierarchies[e].levels) b.hierarchies[e].levels.hasOwnProperty(f) && c.push("[" + a + "]." + b.hierarchies[e].name + ".[" + f + "]");
   return c
  },
  check_dateFilter_saved: function() {
   var a =
    this.workspace.checkDateFilterSaved;
   this.workspace.item && !_.isEmpty(this.workspace.item) && void 0 === a && (a = this.workspace.query.getProperty("saiku.ui.datefilter.data"), this.workspace.dateFilter.add(a));
   this.workspace.checkDateFilterSaved = !0
  },
  check_dateFilter_model: function(a) {
   var b = [],
    c = [],
    d = this.workspace.dateFilter.toJSON(),
    e = d.length,
    f = a.length,
    g = 0,
    h = 0;
   if (0 < f && d && !_.isEmpty(d))
    for (; h < f;) a[h] === d[g].id ? c.push(d[g].id) : b.push(d[g].id), g + 1 < e ? g++ : (g = 0, h++);
   else if (0 === f && d && !_.isEmpty(d)) {
    for (a = 0; a <
     e; a++) this.workspace.dateFilter.remove(d[a].id);
    this.workspace.query.setProperty("saiku.ui.datefilter.data", this.workspace.dateFilter.toJSON())
   }
   this.remove_dateFilter_model(_.difference(b, c))
  },
  remove_dateFilter_model: function(a) {
   var b = a.length,
    c;
   for (c = 0; c < b; c++) this.workspace.dateFilter.remove(a[c]);
   this.workspace.query.setProperty("saiku.ui.datefilter.data", this.workspace.dateFilter.toJSON())
  }
 });
Saiku.events.bind("session:new", function() {
 function a(a) {
  "undefined" === typeof a.workspace.dateFilterObserver && (a.workspace.dateFilterObserver = new DateFilterObserver({
   workspace: a.workspace
  }))
 }
 for (var b = 0, c = Saiku.tabs._tabs.length; b < c; b++) a({
  workspace: Saiku.tabs._tabs[b].content
 });
 Saiku.session.bind("workspace:new", a)
});
var WarningModal = Modal.extend({
  type: "info",
  buttons: [{
   text: "Okay",
   method: "okay"
  }, {
   text: "Cancel",
   method: "close"
  }],
  initialize: function(a) {
   this.options.title = a.title;
   this.message = '\x3cspan class\x3d"i18n"\x3e' + a.message + "\x3c/span\x3e";
   this.cancelfunction = a.cancel;
   this.okayfunction = a.okay;
   this.okaycallbackobject = a.okayobj;
   this.cancelcallbackobject = a.cancelobj
  },
  close: function(a) {
   "#close" === a.target.hash && a.preventDefault();
   null != this.cancelfunction && this.cancelfunction(this.cancelcallbackobject);
   this.$el.dialog("destroy").remove()
  },
  okay: function(a) {
   a.preventDefault();
   null != this.okayfunction && this.okayfunction(this.okaycallbackobject);
   this.$el.dialog("destroy").remove()
  }
 }),
 TitlesModal = Modal.extend({
  type: "info",
  buttons: [{
   text: "Okay",
   method: "okay"
  }, {
   text: "Cancel",
   method: "close"
  }],
  message: _.template("\x3cform id\x3d'login_form'\x3e\x3clabel for\x3d'title' class\x3d'i18n'\x3eTitle\x3c/label\x3e\x3cinput type\x3d'text' id\x3d'title' name\x3d'title' value\x3d'' /\x3e\x3clabel for\x3d'variable' class\x3d'i18n'\x3eVariable\x3c/label\x3e\x3cinput type\x3d'text' id\x3d'variable' name\x3d'variable' value\x3d'' /\x3e\x3clabel for\x3d'explanation' class\x3d'i18n'\x3eExplanation\x3c/label\x3e\x3cinput type\x3d'text' id\x3d'explanation' name\x3d'explanation' value\x3d'' /\x3e\x3c/form\x3e")(),
  initialize: function(a) {
   this.options.title = "Report Titles";
   this.query = a.query
  },
  close: function(a) {
   "#close" === a.target.hash && a.preventDefault();
   this.$el.dialog("destroy").remove()
  },
  okay: function(a) {
   a.preventDefault();
   a = {
    title: $(this.el).find("#title").val(),
    variable: $(this.el).find("#variable").val(),
    explanation: $(this.el).find("#explanation").val()
   };
   a = JSON.stringify(a);
   this.query.setProperty("saiku.ui.headings", a);
   this.query.run(!0);
   this.$el.dialog("destroy").remove()
  }
 });
(function(a) {
 var b;
 a: {
  try {
   document.createElement("$")
  } catch (c) {
   b = c;
   break a
  }
  b = void 0
 }
 a.Base64 || (a.Base64 = {
  encode: function(a) {
   for (var c, f, g, h, k, l, m = 0, n = a.length, s = Math.max, q = ""; m < n;) {
    c = a.charCodeAt(m++) || 0;
    f = a.charCodeAt(m++) || 0;
    l = a.charCodeAt(m++) || 0;
    if (255 < s(c, f, l)) throw b;
    g = c >> 2 & 63;
    c = (c & 3) << 4 | f >> 4 & 15;
    h = (f & 15) << 2 | l >> 6 & 3;
    k = l & 63;
    f ? l || (k = 64) : h = k = 64;
    q += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/\x3d".charAt(g) + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/\x3d".charAt(c) +
     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/\x3d".charAt(h) + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/\x3d".charAt(k)
   }
   return q
  }
 })
})(this);
Backbone.sync = function(a, b, c) {
 methodMap = {
  create: "POST",
  read: "GET",
  update: "PUT",
  "delete": "DELETE"
 };
 var d = methodMap[a],
  e = Settings.REST_URL + (_.isFunction(b.url) ? b.url() : b.url);
 "undefined" == typeof Settings.ERRORS && (Settings.ERRORS = 0);
 var f = function() {
  Settings.ERRORS++;
  Settings.ERRORS < Settings.ERROR_TOLERANCE ? Saiku.session.logout() : Saiku.ui.block("Communication problem with the server. Please reload the application...")
 };
 a = !0;
 !1 === c.async && (a = !1);
 var g = "json";
 "undefined" != typeof c.dataType && (g = c.dataType);
 var h = "application/x-www-form-urlencoded";
 "undefined" != typeof c.contentType && (h = c.contentType);
 b = b.attributes;
 "undefined" != typeof c.data && (b = c.data);
 b = {
  url: e,
  type: d,
  cache: !1,
  data: b,
  contentType: h,
  dataType: g,
  success: function(a, b, d) {
   Settings.ERRORS = 0;
   Saiku.ui.unblock();
   c.success(a, b, d)
  },
  statusCode: {
   0: function() {
    f()
   },
   401: function() {
    f()
   }
  },
  error: function(a, b, f) {
   !isIE && "undefined" != typeof console && console && console.error && (console.error("Error performing " + d + " on " + e), console.error(f));
   c.error && c.error(a,
    b, f)
  },
  async: a
 };
 !1 === c.processData && (b.processData = !1);
 if (Settings.BIPLUGIN && !Settings.BIPLUGIN5 || Backbone.emulateHTTP)
  if ("PUT" === d || "DELETE" === d) Backbone.emulateHTTP && (b.data._method = d), b.type = "POST", b.beforeSend = function(a) {
   a.setRequestHeader("X-HTTP-Method-Override", d)
  };
 $.ajax(b)
};
var QueryRouter = Backbone.Router.extend({
 routes: {
  "query/open/*query_name": "open_query",
  "query/open": "open_query_repository"
 },
 open_query: function(a) {
  Settings.ACTION = "OPEN_QUERY";
  var b;
  b = !Settings.BIPLUGIN5 && Settings.BIPLUGIN ? (Settings.GET.SOLUTION ? Settings.GET.SOLUTION + "/" : "") + (Settings.GET.PATH && "/" != Settings.GET.PATH ? Settings.GET.PATH + "/" : "") + (Settings.GET.ACTION || "") : a;
  var c = _.extend({
   file: b
  }, Settings.PARAMS);
  (new Repository({}, {
   dialog: {
    populate: function(a) {
     if (a && 0 < a.length) {
      var e = new Query(c, {
       name: b
      });
      Saiku.tabs.add(new Workspace({
       query: e,
       item: a[0]
      }))
     } else Saiku.tabs.add(new Workspace);
     Settings.INITIAL_QUERY = !1
    }
   },
   file: b
  })).fetch({
   async: !1,
   data: {
    path: b
   }
  })
 },
 open_query_repository: function() {
  Toolbar.prototype.open_query()
 }
});
Saiku.routers.push(new QueryRouter);
var Tour = Backbone.View.extend({
 initialize: function(a) {
  _.bindAll(this, "run_tour");
  _.extend(this, Backbone.Events);
  this.toolbar = a.toolbar
 },
 run_tour: function() {
  var a = this,
   b = [{
    content: "\x3cp\x3eClick here to open a new query.\x3c/p\x3e",
    highlightTarget: !0,
    nextButton: !1,
    closeButton: !0,
    target: $("#new_query"),
    my: "top left",
    at: "right bottom",
    setup: function(a, b) {
     Saiku.events.bind("toolbar:new_query", this.onSelectKitten)
    },
    teardown: function(a, b) {
     Saiku.events.unbind("toolbar:new_query", this.onSelectKitten)
    },
    bind: ["onSelectKitten"],
    onSelectKitten: function(a, b, e, f) {
     b.view = f;
     a.next()
    }
   }, {
    content: "\x3cp\x3eSelect the Foodmart Sales Cube\x3c/p\x3e",
    highlightTarget: !0,
    nextButton: !1,
    closeButton: !0,
    target: $(".cubes"),
    my: "bottom center",
    at: "top center",
    setup: function(a, b) {
     Saiku.events.bind("workspace:new_query", this.onSelectCube)
    },
    teardown: function(a, b) {
     Saiku.events.unbind("workspace:new_query", this.onSelectCube)
    },
    bind: ["onSelectCube"],
    onSelectCube: function(b, d, e, f) {
     "Sales" === f.cube ? (d.view = f.view, setTimeout(function() {
      a.exec || (a.exec = !0);
      b.next()
     }, 200)) : $(".tour-container").html("\x3cp\x3eYou didn't select the Sales cube.\x3c/p\x3e")
    }
   }, {
    content: "\x3cp\x3eGreat, next we need to execute a query.\x3c/p\x3e",
    highlightTarget: !0,
    nextButton: !0,
    closeButton: !0,
    target: $(".dimension_tree"),
    my: "bottom center",
    at: "top center",
    setup: function(a, b) {
     return {
      target: $(".dimension_tree")
     }
    }
   }, {
    content: "\x3cp\x3eFirst lets expand the Customer dimension.\x3c/p\x3e",
    highlightTarget: !0,
    nextButton: !1,
    closeButton: !0,
    target: $('a[title\x3d"Customer"]'),
    my: "left center",
    at: "right center",
    setup: function(a, b) {
     Saiku.events.bind("workspace:expandDimension", this.onExpandDimension);
     return {
      target: $('a[title\x3d"Customer"]')
     }
    },
    bind: ["onExpandDimension"],
    onExpandDimension: function(a, b, e, f) {
     a.next()
    }
   }, {
    content: "\x3cp\x3eGreat next drag the State Province level to the Rows dropzone.\x3c/p\x3e",
    highlightTarget: !0,
    nextButton: !1,
    closeButton: !0,
    target: $(".rows_fields"),
    my: "left center",
    at: "right center",
    setup: function(a, b) {
     Saiku.events.bind("workspaceDropZone:select_dimension",
      this.onSelectLevel);
     $('a[title\x3d"State Province"]').addClass("tour-highlight");
     return {
      target: $(".rows_fields")
     }
    },
    bind: ["onSelectLevel"],
    onSelectLevel: function(a, b, e, f) {
     "[Customer].[Customers]" === f.hierarchy && "State Province" === f.level ? a.next() : $(".tour-container").html("\x3cp\x3eYou didn't select the correct level. Remove this one and replace it with the highlighted level.\x3c/p\x3e")
    }
   }, {
    content: "\x3cp\x3eNext we'll add a measure. Drag Unit Sales into the Measures Drop Zone.\x3c/p\x3e",
    highlightTarget: !0,
    nextButton: !1,
    closeButton: !0,
    target: $(".rows_fields"),
    my: "left top",
    at: "right bottom",
    setup: function(a, b) {
     Saiku.events.bind("workspaceDropZone:select_measure", this.onSelectMeasure);
     return {
      target: $('a[title\x3d"[Measures].[Unit Sales]"]')
     }
    },
    bind: ["onSelectMeasure"],
    onSelectMeasure: function(a, b, e, f) {
     "Unit Sales" === f.measure.name ? a.next() : $(".tour-container").html("\x3cp\x3eYou didn't select the correct measure. Remove this one and replace it with the highlighted measure.\x3c/p\x3e")
    }
   }, {
    content: "\x3cp\x3eGreat, we've now run a very basic query. Now we'll view it as a chart.\x3c/p\x3e",
    highlightTarget: !0,
    nextButton: !0,
    closeButton: !0,
    target: $(".rows_fields"),
    my: "bottom center",
    at: "top center",
    setup: function(a, b) {
     return {
      target: $("div.table_wrapper")
     }
    }
   }, {
    content: "\x3cp\x3eTo view your data as a chart, click on the chart icon.\x3c/p\x3e",
    highlightTarget: !0,
    nextButton: !1,
    closeButton: !0,
    target: $(".rows_fields"),
    my: "right center",
    at: "left center",
    setup: function(a, b) {
     Saiku.events.bind("queryToolbar:render_chart", this.onClickChartIcon);
     return {
      target: $(".query_toolbar_vertical")
     }
    },
    bind: ["onClickChartIcon"],
    onClickChartIcon: function(a, b, e, f) {
     a.next()
    }
   }, {
    content: "\x3cp\x3eYou can now select from the different chart type Saiku offers.\x3c/p\x3eSaiku Enterprise users can set chart properties by clicking on the properties button.\x3c/p\x3e\x3cp\x3eYou can also export your chart to a file by clicking on the Export button.\x3c/p\x3e",
    highlightTarget: !0,
    nextButton: !0,
    closeButton: !0,
    target: $(".rows_fields"),
    my: "right center",
    at: "left center",
    setup: function(a, b) {
     Saiku.events.bind("queryToolbar:render_chart",
      this.onClickChartIcon);
     return {
      target: $(".query_toolbar_vertical")
     }
    },
    bind: ["onClickChartIcon"],
    onClickChartIcon: function(a, b, e, f) {
     a.next()
    }
   }, {
    content: "\x3cp\x3eOn the workspace toolbar there are a number of useful buttons.\x3c/p\x3e",
    highlightTarget: !0,
    nextButton: !0,
    closeButton: !0,
    target: $(".rows_fields"),
    my: "top center",
    at: "bottom center",
    setup: function(a, b) {
     return {
      target: $(".workspace_toolbar")
     }
    }
   }, {
    content: "\x3cp\x3eEdit Query. This button will hide the query design area on the left of the workspace.\x3c/p\x3e",
    highlightTarget: !0,
    nextButton: !0,
    closeButton: !0,
    target: $(".rows_fields"),
    my: "top center",
    at: "bottom center",
    setup: function(a, b) {
     return {
      target: $('a[original-title\x3d"Edit query"]')
     }
    }
   }, {
    content: "\x3cp\x3eRun Query/Automatic Execution. These icons allow you to manually run a query, or, toggle automatic query execution so that you have to exeucte the query manually.\x3c/p\x3e",
    highlightTarget: !0,
    nextButton: !0,
    closeButton: !0,
    target: $(".rows_fields"),
    my: "top center",
    at: "bottom center",
    setup: function(a,
     b) {
     return {
      target: $('a[original-title\x3d"Run query"]')
     }
    }
   }, {
    content: "\x3cp\x3eHide Parents. This button allows you to show the parent levels in the result set.\x3c/p\x3e\x3cp\x3eHidden by default, some queries are easier understood when you can see the data hierarchy.\x3c/p\x3e",
    highlightTarget: !0,
    nextButton: !0,
    closeButton: !0,
    target: $(".rows_fields"),
    my: "top center",
    at: "bottom center",
    setup: function(a, b) {
     return {
      target: $('a[original-title\x3d"Hide Parents"]')
     }
    }
   }, {
    content: "\x3cp\x3eNon Empty. This button hides null fields so minimise the resultset. Click this button to show the empty fields.\x3c/p\x3e",
    highlightTarget: !0,
    nextButton: !0,
    closeButton: !0,
    target: $(".rows_fields"),
    my: "top center",
    at: "bottom center",
    setup: function(a, b) {
     return {
      target: $('a[original-title\x3d"Non-empty"]')
     }
    }
   }, {
    content: "\x3cp\x3eZoom. Zoom into a large table, by dragging over the area you want to show.\x3c/p\x3e",
    highlightTarget: !0,
    nextButton: !0,
    closeButton: !0,
    target: $(".rows_fields"),
    my: "top center",
    at: "bottom center",
    setup: function(a, b) {
     return {
      target: $('a[original-title\x3d"Zoom into table"]')
     }
    }
   }, {
    content: "\x3cp\x3eDrill Across. A way to discover more about your data. Select drill across and enable the required dimensions in the popup, the new result set will show you a more granular output of your previous query.\x3c/p\x3e",
    highlightTarget: !0,
    nextButton: !0,
    closeButton: !0,
    target: $(".rows_fields"),
    my: "top center",
    at: "bottom center",
    setup: function(a, b) {
     return {
      target: $('a[original-title\x3d"Drill across on cell"]')
     }
    }
   }, {
    content: "\x3cp\x3eDrill Through. Drill through to the lowest level to show how your query was constructed.\x3c/p\x3e",
    highlightTarget: !0,
    nextButton: !0,
    closeButton: !0,
    target: $(".rows_fields"),
    my: "top center",
    at: "bottom center",
    setup: function(a, b) {
     return {
      target: $('a[original-title\x3d"Drill through on cell"]')
     }
    }
   }, {
    content: '\x3cp\x3eWe\'ve now run through the basics that Saiku Analytics has to offer. There is far more that we haven\'t explored so you might want to try one of the more advanced tutorials or just get started and explore yourself.\x3c/p\x3e\x3cp\x3eFor more help, visit \x3ca href\x3d"http://wiki.meteorite.bi" target\x3d"_blank"\x3ehttp://wiki.meteorite.bi\x3c/a\x3e.\x3c/p\x3e',
    highlightTarget: !0,
    nextButton: !0,
    closeButton: !0,
    target: $(".rows_fields"),
    my: "top center",
    at: "bottom center",
    setup: function(a,
     b) {
     return {
      target: $('a[original-title\x3d"Drill through on cell"]')
     }
    }
   }];
  (new Tourist.Tour({
   steps: b,
   stepOptions: {
    view: this.toolbar
   },
   tipClass: "QTip",
   tipOptions: {
    showEffect: "slidein"
   }
  })).start()
 }
});