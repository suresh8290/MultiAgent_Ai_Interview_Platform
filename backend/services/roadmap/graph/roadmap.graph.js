import {StateGraph} from "@langchain/langgraph" ;
import resourceAgent from "../agents/resource.agent.js";
import roadmapAgent from "../agents/roadmap.agent.js";
import { RoadmapState } from "./roadmap.state.js";


const graph = new StateGraph(RoadmapState)
.addNode("roadmapAgent" , roadmapAgent)
.addNode("resourceAgent", resourceAgent)

.addEdge("__start__" , "roadmapAgent")
.addEdge("roadmapAgent", "resourceAgent")
.addEdge("resourceAgent", "__end__")
.compile()

export default graph




 