import { ElementRef } from '@angular/core';
import { BaseDirective2, MediaMarshaller, StyleBuilder, StyleUtils } from '@ngbracket/ngx-layout/core';
import * as i0 from "@angular/core";
export interface GridAreasParent {
    inline: boolean;
}
export declare class GridAreasStyleBuiler extends StyleBuilder {
    buildStyles(input: string, parent: GridAreasParent): {
        display: string;
        'grid-template-areas': string;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<GridAreasStyleBuiler, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<GridAreasStyleBuiler>;
}
export declare class GridAreasDirective extends BaseDirective2 {
    protected DIRECTIVE_KEY: string;
    get inline(): boolean;
    set inline(val: boolean);
    protected _inline: boolean;
    constructor(elRef: ElementRef, styleUtils: StyleUtils, styleBuilder: GridAreasStyleBuiler, marshal: MediaMarshaller);
    protected updateWithValue(value: string): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<GridAreasDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<GridAreasDirective, never, never, { "inline": { "alias": "gdInline"; "required": false; }; }, {}, never, never, true, never>;
}
/**
 * 'grid-template-areas' CSS Grid styling directive
 * Configures the names of elements within the grid
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-14
 */
export declare class DefaultGridAreasDirective extends GridAreasDirective {
    protected inputs: string[];
    static ɵfac: i0.ɵɵFactoryDeclaration<DefaultGridAreasDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DefaultGridAreasDirective, "  [gdAreas],  [gdAreas.xs], [gdAreas.sm], [gdAreas.md], [gdAreas.lg], [gdAreas.xl],  [gdAreas.lt-sm], [gdAreas.lt-md], [gdAreas.lt-lg], [gdAreas.lt-xl],  [gdAreas.gt-xs], [gdAreas.gt-sm], [gdAreas.gt-md], [gdAreas.gt-lg]", never, { "gdAreas": { "alias": "gdAreas"; "required": false; }; "gdAreas.xs": { "alias": "gdAreas.xs"; "required": false; }; "gdAreas.sm": { "alias": "gdAreas.sm"; "required": false; }; "gdAreas.md": { "alias": "gdAreas.md"; "required": false; }; "gdAreas.lg": { "alias": "gdAreas.lg"; "required": false; }; "gdAreas.xl": { "alias": "gdAreas.xl"; "required": false; }; "gdAreas.lt-sm": { "alias": "gdAreas.lt-sm"; "required": false; }; "gdAreas.lt-md": { "alias": "gdAreas.lt-md"; "required": false; }; "gdAreas.lt-lg": { "alias": "gdAreas.lt-lg"; "required": false; }; "gdAreas.lt-xl": { "alias": "gdAreas.lt-xl"; "required": false; }; "gdAreas.gt-xs": { "alias": "gdAreas.gt-xs"; "required": false; }; "gdAreas.gt-sm": { "alias": "gdAreas.gt-sm"; "required": false; }; "gdAreas.gt-md": { "alias": "gdAreas.gt-md"; "required": false; }; "gdAreas.gt-lg": { "alias": "gdAreas.gt-lg"; "required": false; }; }, {}, never, never, true, never>;
}
