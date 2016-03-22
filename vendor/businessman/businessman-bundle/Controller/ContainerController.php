<?php
namespace BusinessMan\Bundle\BusinessManBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller,
    Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache,
    Symfony\Component\HttpFoundation\Response,
    Synergize\Bundle\DbalBundle\Type\ContainerField;

/**
 * ContainerController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessman/BusinessManBundle
 */
class ContainerController extends Controller
{
    /**
     * @Cache(smaxage=86400, maxage=86400, public=true)
     */
    public function retrieveAction($encodedUrl)
    {
        $container = new ContainerField(base64_decode($encodedUrl));

        $url = sprintf(
            '%s://%s:%s%s',
            $this->container->getParameter('businessman.protocol'),
            $this->container->getParameter('businessman.host'),
            $this->container->getParameter('businessman.port'),
            $container->getUrl()
        );

        try {
            return new Response(file_get_contents($url), 200, array('Content-Type' => $container->getContentType()));
        } catch (\Exception $e) {
            throw $this->createNotFoundException();
        }
    }
}
