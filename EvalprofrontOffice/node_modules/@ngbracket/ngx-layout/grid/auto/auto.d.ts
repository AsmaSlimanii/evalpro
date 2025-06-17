import { ElementRef } from '@angular/core';
import { BaseDirective2, MediaMarshaller, StyleBuilder, StyleUtils } from '@ngbracket/ngx-layout/core';
import * as i0 from "@angular/core";
export interface GridAutoParent {
    inline: boolean;
}
export declare class GridAutoStyleBuilder extends StyleBuilder {
    buildStyles(input: string, parent: GridAutoParent): {
        display: string;
        'grid-auto-flow': string;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<GridAutoStyleBuilder, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<GridAutoStyleBuilder>;
}
export declare class GridAutoDirective extends BaseDirective2 {
    get inline(): boolean;
    set inline(val: boolean);
    protected _inline: boolean;
    protected DIRECTIVE_KEY: string;
    constructor(elementRef: ElementRef, styleBuilder: GridAutoStyleBuilder, styler: StyleUtils, marshal: MediaMarshaller);
    protected updateWithValue(value: string): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<GridAutoDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<GridAutoDirective, never, never, { "inline": { "alias": "gdInline"; "required": false; }; }, {}, never, never, true, never>;
}
/**
 * 'grid-auto-flow' CSS Grid styling directive
 * Configures the auto placement algorithm for the grid
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-23
 */
export declare class DefaultGridAutoDirective extends GridAutoDirective {
    protected inputs: string[];
    static ɵfac: i0.ɵɵFactoryDeclaration<DefaultGridAutoDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DefaultGridAutoDirective, "  [gdAuto],  [gdAuto.xs], [gdAuto.sm], [gdAuto.md], [gdAuto.lg], [gdAuto.xl],  [gdAuto.lt-sm], [gdAuto.lt-md], [gdAuto.lt-lg], [gdAuto.lt-xl],  [gdAuto.gt-xs], [gdAuto.gt-sm], [gdAuto.gt-md], [gdAuto.gt-lg]", never, { "gdAuto": { "alias": "gdAuto"; "required": false; }; "gdAuto.xs": { "alias": "gdAuto.xs"; "required": false; }; "gdAuto.sm": { "alias": "gdAuto.sm"; "required": false; }; "gdAuto.md": { "alias": "gdAuto.md"; "required": false; }; "gdAuto.lg": { "alias": "gdAuto.lg"; "required": false; }; "gdAuto.xl": { "alias": "gdAuto.xl"; "required": false; }; "gdAuto.lt-sm": { "alias": "gdAuto.lt-sm"; "required": false; }; "gdAuto.lt-md": { "alias": "gdAuto.lt-md"; "required": false; }; "gdAuto.lt-lg": { "alias": "gdAuto.lt-lg"; "required": false; }; "gdAuto.lt-xl": { "alias": "gdAuto.lt-xl"; "required": false; }; "gdAuto.gt-xs": { "alias": "gdAuto.gt-xs"; "required": false; }; "gdAuto.gt-sm": { "alias": "gdAuto.gt-sm"; "required": false; }; "gdAuto.gt-md": { "alias": "gdAuto.gt-md"; "required": false; }; "gdAuto.gt-lg": { "alias": "gdAuto.gt-lg"; "required": false; }; }, {}, never, never, true, never>;
}
