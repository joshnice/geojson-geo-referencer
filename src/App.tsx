import { CadPlacementComponent } from "./components/cad-placement/cad-placement";
import { initialSubjectContext, SubjectsContext } from "./state/subjects-context";
import "./App.css";

function App() {

	return (
		<div className="root">
			<SubjectsContext.Provider value={initialSubjectContext}>
				<CadPlacementComponent />
			</SubjectsContext.Provider>
		</div>
	);
}

export default App;
