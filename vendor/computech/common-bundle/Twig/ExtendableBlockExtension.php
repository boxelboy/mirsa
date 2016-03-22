<?php
namespace Computech\Bundle\CommonBundle\Twig;

use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Computech\Bundle\CommonBundle\Event\RenderExtendableBlockEvent;

/**
 * ExtendableBlockExtension
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/CommonBundle
 */
class ExtendableBlockExtension extends \Twig_Extension
{
    /**
     * @var \Twig_Environment
     */
    protected $twig;

    /**
     * @var EventDispatcherInterface
     */
    protected $eventDispatcher;

    /**
     * @param EventDispatcherInterface $eventDispatcher
     */
    public function __construct(EventDispatcherInterface $eventDispatcher)
    {
        $this->eventDispatcher = $eventDispatcher;
    }

    /**
     * @param \Twig_Environment $twig
     */
    public function initRuntime(\Twig_Environment $twig)
    {
        $this->twig = $twig;
    }

    /**
     * @return array|\Twig_SimpleFunction
     */
    public function getFunctions()
    {
        return array(
            new \Twig_SimpleFunction('extendable_block', array($this, 'renderBlock'), array('is_safe' => array('html')))
        );
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'extendable_block';
    }

    /**
     * @param string $name
     * @param array  $parameters
     *
     * @return string
     */
    public function renderBlock($name, array $parameters = array())
    {
        $event = new RenderExtendableBlockEvent($name, $parameters);
        $this->eventDispatcher->dispatch('extendable_block.render.' . $name, $event);

        return $this->twig->render('ComputechCommonBundle:ExtendableBlock:render.html.twig', array(
            'controllers' => $event->getControllers(),
            'parameters' => $parameters
        ));
    }
}
