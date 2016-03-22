<?php
namespace Computech\Bundle\CommonBundle\DependencyInjection\Security\Factory;

use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;
use Symfony\Component\DependencyInjection\DefinitionDecorator;
use Symfony\Component\Config\Definition\Builder\NodeDefinition;
use Symfony\Bundle\SecurityBundle\DependencyInjection\Security\Factory\SecurityFactoryInterface;

/**
 * Register FileMaker bridge token authentication listener
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/computech/CommonBundle
 */
class BridgeTokenAuthenticationFactory implements SecurityFactoryInterface
{
    /**
     * {@inheritDoc}
     */
    public function create(ContainerBuilder $container, $id, $config, $userProvider, $defaultEntryPoint)
    {
        $providerId = 'security.authentication.bridge_token_provider.' . $id;
        $listenerId = 'security.authentication.bridge_token_listener.' . $id;

        $container
            ->setDefinition($providerId, new DefinitionDecorator('security.authentication.bridge_token_provider'))
            ->replaceArgument(0, new Reference($userProvider));

        $container->setDefinition($listenerId, new DefinitionDecorator('security.authentication.bridge_token_listener'));

        return array($providerId, $listenerId, $defaultEntryPoint);
    }

    /**
     * {@inheritDoc}
     */
    public function getPosition()
    {
        return 'pre_auth';
    }

    /**
     * {@inheritDoc}
     */
    public function getKey()
    {
        return 'filemaker_bridge';
    }

    /**
     * {@inheritDoc}
     */
    public function addConfiguration(NodeDefinition $node)
    {
    }
}
