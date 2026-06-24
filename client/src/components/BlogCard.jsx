function BlogCard({ title, description, image }) {
  const handleReadMore = () => {
    alert(`${title} read more will be available in the next project phase.`);
  };

  return (
    <article className="blog-card">
      <img src={image} alt={title} />
      <div className="blog-card-body">
        <h3>{title}</h3>
        <p>{description}</p>
        <button className="btn card-btn" type="button" onClick={handleReadMore}>
          Read More
        </button>
      </div>
    </article>
  );
}

export default BlogCard;
