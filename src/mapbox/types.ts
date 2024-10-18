import type { Subject } from "rxjs";

export interface Subjects {
	$rotation: Subject<number>;
	$geoReferenceCad: Subject<void>;
	$eventLock: Subject<MouseEvent>;
	$moveBackground: Subject<boolean>;
	$moveCad: Subject<boolean>;
}
