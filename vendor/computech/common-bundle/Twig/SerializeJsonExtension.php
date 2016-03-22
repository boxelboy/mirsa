<?php
namespace Computech\Bundle\CommonBundle\Twig;

use JMS\Serializer\SerializationContext;
use JMS\Serializer\SerializerInterface;

/**
 * SerializeJsonExtension
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/computech/CommonBundle
 */
class SerializeJsonExtension extends \Twig_Extension
{
    /**
     * @var \JMS\Serializer\SerializerInterface
     */
    protected $serializer;

    /**
     * @param SerializerInterface $serializer
     */
    public function __construct(SerializerInterface $serializer)
    {
        $this->serializer = $serializer;
    }

    /**
     * {@inheritDoc}
     */
    public function getFilters()
    {
        return array(
            new \Twig_SimpleFilter('serialize_json', array($this, 'serialize'), array('is_safe' => array('html')))
        );
    }

    /**
     * Serialize the entity to JSON
     *
     * @param mixed $entity
     *
     * @return string
     */
    public function serialize($entity)
    {
        $context = new SerializationContext();
        $context->setSerializeNull(true);

        return $this->serializer->serialize($entity, 'json', $context);
    }

    /**
     * {@inheritDoc}
     */
    public function getName()
    {
        return 'serialize_json';
    }
}
