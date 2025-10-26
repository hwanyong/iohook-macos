/**
 * CGEventType 매핑 테이블 (CommonJS)
 */
const CGEventTypes = {
  0: "null",
  1: "leftMouseDown", 
  2: "leftMouseUp",
  3: "rightMouseDown",
  4: "rightMouseUp",
  5: "mouseMoved",
  6: "leftMouseDragged",
  7: "rightMouseDragged",
  10: "keyDown",
  11: "keyUp",
  12: "flagsChanged",
  22: "scrollWheel",
  23: "tabletPointer",
  24: "tabletProximity",
  25: "otherMouseDown",
  26: "otherMouseUp",
  27: "otherMouseDragged"
}

/**
 * 역방향 매핑 (String → Int)
 */
const EventTypeToInt = {}
Object.keys(CGEventTypes).forEach(key => {
  EventTypeToInt[CGEventTypes[key]] = parseInt(key)
})

module.exports = { CGEventTypes, EventTypeToInt }