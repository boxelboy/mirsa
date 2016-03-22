<?php
namespace Computech\Bundle\CommonBundle\Event;

use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\EventDispatcher\Event;

/**
 * Event fired when an extendable block is being rendered
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/CommonBundle
 */
class RenderExtendableBlockEvent extends Event
{
    const METHOD_ESI = 'esi';
    const METHOD_HINCLUDE = 'hinclude';

    /**
     * @var ArrayCollection
     */
    protected $controllers;

    /**
     * @var string
     */
    protected $name;

    /**
     * @var array
     */
    protected $parameters;

    /**
     * Constructor
     */
    public function __construct($name, array $parameters)
    {
        $this->controllers = new ArrayCollection();
        $this->name = $name;
        $this->parameters = $parameters;
    }

    /**
     * @return ArrayCollection
     */
    public function getControllers()
    {
        return $this->controllers;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @return array
     */
    public function getParameters()
    {
        return $this->parameters;
    }

    /**
     * Renders a controller using the given method
     *
     * METHOD_HINCLUDE should not be used if the controller's response contains Javascript that needs
     * to be executed on load. If METHOD_ESI is used, the controller should set valid and sensible cache control
     * headers
     *
     * @param string $controller
     * @param string $method
     *
     * @throws \InvalidArgumentException
     */
    public function addController($controller, $method = self::METHOD_ESI)
    {
        if (!in_array($method, array(self::METHOD_ESI, self::METHOD_HINCLUDE))) {
            throw new \InvalidArgumentException(sprintf('Invalid method "%"', $method));
        }

        $this->controllers->add(array('controller' => $controller, 'method' => $method));
    }
}
