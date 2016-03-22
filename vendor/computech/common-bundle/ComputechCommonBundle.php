<?php
namespace Computech\Bundle\CommonBundle;

use Computech\Bundle\CommonBundle\DependencyInjection\Security\Factory\BridgeTokenAuthenticationFactory;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\HttpKernel\Bundle\Bundle;

/**
 * {@inheritDoc}
 */
class ComputechCommonBundle extends Bundle
{
    /**
     * {@inheritDoc}
     */
    public function build(ContainerBuilder $container)
    {
        parent::build($container);

        $extension = $container->getExtension('security');
        $extension->addSecurityListenerFactory(new BridgeTokenAuthenticationFactory());
    }
}
