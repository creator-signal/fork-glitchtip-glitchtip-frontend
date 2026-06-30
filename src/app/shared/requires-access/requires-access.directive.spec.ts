import { describe, it, expect, beforeEach } from "vitest";
import { Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RequiresAccessDirective } from "./requires-access.directive";

/**
 * This directive is the single place permission-gated UI decides whether to
 * render. Several destructive actions (delete team, remove member, delete alert
 * recipient) rely on it, so a regression here silently re-exposes controls to
 * users who cannot use them. The behavior is binary and reactive, so it is
 * cheap to pin down.
 */
@Component({
  standalone: true,
  imports: [RequiresAccessDirective],
  template: `<button *gtRequiresAccess="canAccess()">Action</button>`,
})
class HostComponent {
  canAccess = signal(false);
}

describe("RequiresAccessDirective", () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const button = () => fixture.nativeElement.querySelector("button");

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
  });

  it("does not render the element when access is denied", () => {
    host.canAccess.set(false);
    fixture.detectChanges();
    expect(button()).toBeNull();
  });

  it("renders the element when access is granted", () => {
    host.canAccess.set(true);
    fixture.detectChanges();
    expect(button()).not.toBeNull();
  });

  it("reacts to access changing at runtime", () => {
    host.canAccess.set(true);
    fixture.detectChanges();
    expect(button()).not.toBeNull();

    host.canAccess.set(false);
    fixture.detectChanges();
    expect(button()).toBeNull();
  });
});
