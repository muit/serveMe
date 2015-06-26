
//ES6 Temporal implementation
Object.assign = function(target, object) {
  if (typeof object == 'undefined') {
    return object;
  } else if (typeof target == 'undefined') {
    return target;
  }
  var item, tItem;
  for (var prop in object) {
    item = object[prop];
    if (typeof item == 'object' && item !== null) {
      tItem = target[prop];
      if (typeof tItem == 'object' && tItem !== null) {
        target[prop] = Object.assign(tItem, item);
      } else {
        target[prop] = item;
      }
    } else if (item !== null) {
      target[prop] = item;
    }
  }
  return target;
}
