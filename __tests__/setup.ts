import "raf/polyfill"
import { configure } from "enzyme"
import Adapter from "enzyme-adapter-react-16"

// alternative to webpack provide plugin
;(window as any).React = require("react")

configure({ adapter: new Adapter() })
