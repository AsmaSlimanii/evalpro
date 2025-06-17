/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directionality } from '@angular/cdk/bidi';
import { AfterContentInit, ElementRef, NgZone, OnDestroy } from '@angular/core';
import { BaseDirective2, ElementMatcher, LayoutConfigOptions, MediaMarshaller, StyleBuilder, StyleDefinition, StyleUtils } from '@ngbracket/ngx-layout/core';
import { Subject } from 'rxjs';
import * as i0 from "@angular/core";
export interface LayoutGapParent {
    directionality: string;
    items: HTMLElement[];
    layout: string;
}
export declare class LayoutGapStyleBuilder extends StyleBuilder {
    private _styler;
    private _config;
    constructor(_styler: StyleUtils, _config: LayoutConfigOptions);
    buildStyles(gapValue: string, parent: LayoutGapParent): StyleDefinition;
    sideEffect(gapValue: string, _styles: StyleDefinition, parent: LayoutGapParent): void;
    private addFallbackUnit;
    static ɵfac: i0.ɵɵFactoryDeclaration<LayoutGapStyleBuilder, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<LayoutGapStyleBuilder>;
}
/**
 * 'layout-padding' styling directive
 *  Defines padding of child elements in a layout container
 */
export declare class LayoutGapDirective extends BaseDirective2 implements AfterContentInit, OnDestroy {
    protected zone: NgZone;
    protected directionality: Directionality;
    protected styleUtils: StyleUtils;
    protected layout: string;
    protected DIRECTIVE_KEY: string;
    protected observerSubject: Subject<void>;
    /** Special accessor to query for all child 'element' nodes regardless of type, class, etc */
    protected get childrenNodes(): HTMLElement[];
    constructor(elRef: ElementRef, zone: NgZone, directionality: Directionality, styleUtils: StyleUtils, styleBuilder: LayoutGapStyleBuilder, marshal: MediaMarshaller);
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    /**
     * Cache the parent container 'flex-direction' and update the 'margin' styles
     */
    protected onLayoutChange(matcher: ElementMatcher): void;
    /**
     *
     */
    protected updateWithValue(value: string): void;
    /** We need to override clearStyles because in most cases mru isn't populated */
    protected clearStyles(): void;
    /** Determine if an element will show or hide based on current activation */
    protected willDisplay(source: HTMLElement): boolean;
    protected buildChildObservable(): void;
    protected observer?: MutationObserver;
    static ɵfac: i0.ɵɵFactoryDeclaration<LayoutGapDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<LayoutGapDirective, never, never, {}, {}, never, never, true, never>;
}
export declare class DefaultLayoutGapDirective extends LayoutGapDirective {
    protected inputs: string[];
    static ɵfac: i0.ɵɵFactoryDeclaration<DefaultLayoutGapDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DefaultLayoutGapDirective, "  [fxLayoutGap], [fxLayoutGap.xs], [fxLayoutGap.sm], [fxLayoutGap.md],  [fxLayoutGap.lg], [fxLayoutGap.xl], [fxLayoutGap.lt-sm], [fxLayoutGap.lt-md],  [fxLayoutGap.lt-lg], [fxLayoutGap.lt-xl], [fxLayoutGap.gt-xs], [fxLayoutGap.gt-sm],  [fxLayoutGap.gt-md], [fxLayoutGap.gt-lg]", never, { "fxLayoutGap": { "alias": "fxLayoutGap"; "required": false; }; "fxLayoutGap.xs": { "alias": "fxLayoutGap.xs"; "required": false; }; "fxLayoutGap.sm": { "alias": "fxLayoutGap.sm"; "required": false; }; "fxLayoutGap.md": { "alias": "fxLayoutGap.md"; "required": false; }; "fxLayoutGap.lg": { "alias": "fxLayoutGap.lg"; "required": false; }; "fxLayoutGap.xl": { "alias": "fxLayoutGap.xl"; "required": false; }; "fxLayoutGap.lt-sm": { "alias": "fxLayoutGap.lt-sm"; "required": false; }; "fxLayoutGap.lt-md": { "alias": "fxLayoutGap.lt-md"; "required": false; }; "fxLayoutGap.lt-lg": { "alias": "fxLayoutGap.lt-lg"; "required": false; }; "fxLayoutGap.lt-xl": { "alias": "fxLayoutGap.lt-xl"; "required": false; }; "fxLayoutGap.gt-xs": { "alias": "fxLayoutGap.gt-xs"; "required": false; }; "fxLayoutGap.gt-sm": { "alias": "fxLayoutGap.gt-sm"; "required": false; }; "fxLayoutGap.gt-md": { "alias": "fxLayoutGap.gt-md"; "required": false; }; "fxLayoutGap.gt-lg": { "alias": "fxLayoutGap.gt-lg"; "required": false; }; }, {}, never, never, true, never>;
}
