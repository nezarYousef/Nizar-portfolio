/* Server component. It only marks an element as revealable; a single
   client-side controller (RevealController) arms and observes all of them.
   Previously this was itself a client component, which meant 33 component
   boundaries and 33 IntersectionObservers on the page - all of it hydration
   work for a fade-in. */
export default function Reveal({
  as: Tag = "div",
  children,
  delay = 0,
  className,
  ...rest
}) {
  return (
    <Tag
      data-reveal=""
      className={className}
      style={delay ? { "--reveal-delay": `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
